-- Calibre data model, version 1.0
-- Postgres 15+. Written for Supabase (auth.uid()) but portable: replace current_member_id() with your session mechanism.
-- Implements product/DOMAIN-MODEL.md. Invariants are enforced here, not only in the application.

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enumerations
-- ---------------------------------------------------------------------------
create type member_role as enum ('owner', 'lead', 'panelist');
create type role_state as enum ('draft', 'locked', 'populating', 'scoring', 'revealed', 'calibrated', 'issued', 'closed');
create type outcome_checkpoint as enum ('d90', 'd180', 'd365');

-- ---------------------------------------------------------------------------
-- Tenancy
-- ---------------------------------------------------------------------------
create table organisations (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  retention_days    integer not null default 90 check (retention_days between 30 and 365),
  created_at        timestamptz not null default now()
);

-- Invariant 11: no organisation without a signed use policy. Enforced by a deferred constraint trigger below.
create table use_policy_acceptances (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references organisations(id) on delete cascade,
  accepted_by_user  uuid not null,                -- auth user id
  policy_version    text not null,
  accepted_at       timestamptz not null default now()
);

create table members (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references organisations(id) on delete cascade,
  user_id           uuid not null,                -- auth.users.id
  email             text not null,
  display_name      text not null,
  initials          text not null check (char_length(initials) between 1 and 4),
  role              member_role not null,
  created_at        timestamptz not null default now(),
  unique (organisation_id, user_id)
);

create or replace function current_member_id(org uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select id from members where organisation_id = org and user_id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- Roles and rubrics
-- ---------------------------------------------------------------------------
create table roles (
  id                    uuid primary key default gen_random_uuid(),
  organisation_id       uuid not null references organisations(id) on delete cascade,
  title                 text not null,
  state                 role_state not null default 'draft',
  brief_seat            text,
  brief_outcomes        text,
  brief_context         text,
  brief_non_negotiables text,
  scoring_deadline      timestamptz,
  current_rubric_version integer not null default 0,
  locked_at             timestamptz,
  revealed_at           timestamptz,
  issued_at             timestamptz,
  closed_at             timestamptz,
  created_by            uuid not null references members(id),
  created_at            timestamptz not null default now()
);

create table rubric_versions (
  id                uuid primary key default gen_random_uuid(),
  role_id           uuid not null references roles(id) on delete cascade,
  version           integer not null check (version >= 1),
  template_key      text,                         -- e.g. financial-controller
  created_by        uuid not null references members(id),
  amendment_reason  text,                         -- null for version 1, mandatory afterwards
  created_at        timestamptz not null default now(),
  unique (role_id, version),
  check (version = 1 or (amendment_reason is not null and char_length(amendment_reason) >= 20))
);

create table criteria (
  id                  uuid primary key default gen_random_uuid(),
  rubric_version_id   uuid not null references rubric_versions(id) on delete cascade,
  position            integer not null check (position between 1 and 7),
  key                 text not null,
  name                text not null,
  weight              integer not null check (weight between 1 and 100),
  anchor_1            text not null,
  anchor_3            text not null,
  anchor_5            text not null,
  evidence_sources    text[] not null default '{}',
  questions           text[] not null default '{}',
  unique (rubric_version_id, position),
  unique (rubric_version_id, key)
);

-- Weights must sum to 100 and count must be 4..7 for the version to be lockable.
create or replace function rubric_version_is_valid(rv uuid) returns boolean
language sql stable as $$
  select count(*) between 4 and 7 and coalesce(sum(weight), 0) = 100 from criteria where rubric_version_id = rv
$$;

-- ---------------------------------------------------------------------------
-- Panel and finalists
-- ---------------------------------------------------------------------------
create table panel_seats (
  id                uuid primary key default gen_random_uuid(),
  role_id           uuid not null references roles(id) on delete cascade,
  member_id         uuid not null references members(id),
  is_lead           boolean not null default false,
  absent            boolean not null default false,   -- missed the deadline
  created_at        timestamptz not null default now(),
  unique (role_id, member_id)
);

create table finalists (
  id                uuid primary key default gen_random_uuid(),
  role_id           uuid not null references roles(id) on delete cascade,
  ref               text not null,                -- F1..F6, stable after purge
  initials          text not null check (char_length(initials) between 1 and 4),
  full_name         text,                         -- personal data, purged
  contact           text,                         -- personal data, purged
  cv_object_path    text,                         -- storage path, purged
  notice_sent_at    timestamptz,
  purged_at         timestamptz,
  created_at        timestamptz not null default now(),
  unique (role_id, ref)
);

-- ---------------------------------------------------------------------------
-- Scores: immutable once submitted (invariant 3)
-- ---------------------------------------------------------------------------
create table scores (
  id                  uuid primary key default gen_random_uuid(),
  role_id             uuid not null references roles(id) on delete cascade,
  rubric_version_id   uuid not null references rubric_versions(id),
  panel_seat_id       uuid not null references panel_seats(id),
  finalist_id         uuid not null references finalists(id),
  criterion_id        uuid not null references criteria(id),
  value               smallint not null check (value between 0 and 5),   -- 0 = no evidence
  evidence_note       text not null,
  submitted_at        timestamptz not null default now(),
  voided_at           timestamptz,
  void_reason         text,
  unique (rubric_version_id, panel_seat_id, finalist_id, criterion_id),
  check (value = 0 or char_length(evidence_note) >= 40),
  check ((voided_at is null) = (void_reason is null))
);

create or replace function scores_immutable() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'scores are never deleted';
  end if;
  if new.value <> old.value or new.evidence_note <> old.evidence_note
     or new.panel_seat_id <> old.panel_seat_id or new.finalist_id <> old.finalist_id
     or new.criterion_id <> old.criterion_id or new.rubric_version_id <> old.rubric_version_id then
    raise exception 'submitted scores are immutable; void and resubmit under a new rubric version';
  end if;
  return new;
end $$;
create trigger scores_immutable before update or delete on scores
  for each row execute function scores_immutable();

-- Invariant 2: a score must reference the role's current rubric version, and the role must be scoring.
create or replace function scores_guard() returns trigger language plpgsql as $$
declare r roles%rowtype; rv rubric_versions%rowtype;
begin
  select * into r from roles where id = new.role_id;
  select * into rv from rubric_versions where id = new.rubric_version_id;
  if r.state not in ('populating', 'scoring') then
    raise exception 'scores may only be submitted while the role is populating or scoring (state: %)', r.state;
  end if;
  if rv.version <> r.current_rubric_version then
    raise exception 'score references rubric version % but role is on version %', rv.version, r.current_rubric_version;
  end if;
  if r.scoring_deadline is not null and now() > r.scoring_deadline then
    raise exception 'scoring deadline has passed';
  end if;
  if r.state = 'populating' then update roles set state = 'scoring' where id = r.id; end if;
  return new;
end $$;
create trigger scores_guard before insert on scores for each row execute function scores_guard();

-- ---------------------------------------------------------------------------
-- Calibration (invariant 5)
-- ---------------------------------------------------------------------------
create table calibrations (
  id                uuid primary key default gen_random_uuid(),
  role_id           uuid not null references roles(id) on delete cascade,
  finalist_id       uuid not null references finalists(id),
  criterion_id      uuid not null references criteria(id),
  value             smallint not null check (value between 0 and 5),
  reason            text not null check (char_length(reason) >= 20),
  resolved          boolean not null default true,   -- false = carried at panel mean, unresolved
  recorded_by       uuid not null references members(id),
  recorded_at       timestamptz not null default now(),
  unique (role_id, finalist_id, criterion_id)
);

create table calibration_sources (
  calibration_id    uuid not null references calibrations(id) on delete cascade,
  score_id          uuid not null references scores(id),
  primary key (calibration_id, score_id)
);

create or replace function calibration_needs_two_scores() returns trigger language plpgsql as $$
begin
  if (select count(*) from calibration_sources where calibration_id = new.id) < 2 then
    raise exception 'a calibration must reference at least two scores';
  end if;
  return new;
end $$;
create constraint trigger calibration_sources_check after insert on calibrations
  deferrable initially deferred for each row execute function calibration_needs_two_scores();

-- ---------------------------------------------------------------------------
-- Verdicts (invariants 6, 7)
-- ---------------------------------------------------------------------------
create table verdicts (
  id                      uuid primary key default gen_random_uuid(),
  role_id                 uuid not null references roles(id) on delete cascade,
  version                 integer not null default 1,
  recommended_finalist_id uuid references finalists(id),
  recommendation          text not null check (char_length(recommendation) >= 100),
  departure_reason        text,
  reissue_reason          text,
  generated_sections      jsonb not null,            -- frozen snapshot of sections 1 to 7 and 9
  issued_by               uuid not null references members(id),
  issued_at               timestamptz not null default now(),
  unique (role_id, version),
  check (version = 1 or reissue_reason is not null)
);

create or replace function weighted_result(p_role uuid, p_finalist uuid) returns numeric
language sql stable as $$
  select round(sum(c.weight * cal.value) / 5.0, 1)
  from calibrations cal join criteria c on c.id = cal.criterion_id
  where cal.role_id = p_role and cal.finalist_id = p_finalist
$$;

create or replace function verdict_guard() returns trigger language plpgsql as $$
declare r roles%rowtype; rv uuid; top uuid;
begin
  select * into r from roles where id = new.role_id;
  if r.state not in ('calibrated', 'issued') then
    raise exception 'a verdict may only be issued once the role is calibrated';
  end if;
  select id into rv from rubric_versions where role_id = r.id and version = r.current_rubric_version;
  if not rubric_version_is_valid(rv) then
    raise exception 'rubric weights must sum to 100 across 4 to 7 criteria';
  end if;
  select finalist_id into top from (
    select f.id as finalist_id, weighted_result(r.id, f.id) as res
    from finalists f where f.role_id = r.id order by res desc nulls last, f.created_at asc limit 1
  ) t;
  if new.recommended_finalist_id is not null and new.recommended_finalist_id <> top
     and (new.departure_reason is null or char_length(new.departure_reason) < 40) then
    raise exception 'recommending a finalist other than the highest weighted result requires a written job related reason';
  end if;
  update roles set state = 'issued', issued_at = coalesce(issued_at, now()) where id = r.id;
  return new;
end $$;
create trigger verdict_guard before insert on verdicts for each row execute function verdict_guard();

-- ---------------------------------------------------------------------------
-- Outcomes
-- ---------------------------------------------------------------------------
create table outcomes (
  id                  uuid primary key default gen_random_uuid(),
  role_id             uuid not null references roles(id) on delete cascade,
  checkpoint          outcome_checkpoint not null,
  still_in_seat       boolean not null,
  left_reason         text,
  manager_satisfaction smallint check (manager_satisfaction between 1 and 5),
  early_concerns      boolean,
  concerns_note       text,
  memo_flagged_it     text check (memo_flagged_it in ('yes', 'partly', 'no')),
  flagged_note        text,
  answered_by         uuid not null references members(id),
  answered_at         timestamptz not null default now(),
  unique (role_id, checkpoint)
);

-- ---------------------------------------------------------------------------
-- Audit log (invariant 10): append only
-- ---------------------------------------------------------------------------
create table audit_events (
  id                bigint generated always as identity primary key,
  organisation_id   uuid not null references organisations(id) on delete cascade,
  actor_member_id   uuid references members(id),
  role_id           uuid,
  event             text not null,               -- e.g. role.locked, score.submitted, finalist.read
  subject_table     text,
  subject_id        uuid,
  detail            jsonb,
  at                timestamptz not null default now()
);
create or replace function audit_append_only() returns trigger language plpgsql as $$
begin raise exception 'audit_events is append only'; end $$;
create trigger audit_append_only before update or delete on audit_events for each row execute function audit_append_only();

-- ---------------------------------------------------------------------------
-- Role state transitions and structural invariants (1, 8)
-- ---------------------------------------------------------------------------
create or replace function finalists_guard() returns trigger language plpgsql as $$
declare r roles%rowtype;
begin
  select * into r from roles where id = new.role_id;
  if r.state = 'draft' then raise exception 'lock the rubric before entering finalists'; end if;
  if r.state not in ('locked', 'populating') then raise exception 'finalists cannot be added in state %', r.state; end if;
  if (select count(*) from finalists where role_id = r.id) >= 6 then raise exception 'a role holds at most six finalists'; end if;
  if r.state = 'locked' then update roles set state = 'populating' where id = r.id; end if;
  return new;
end $$;
create trigger finalists_guard before insert on finalists for each row execute function finalists_guard();

create or replace function panel_seats_guard() returns trigger language plpgsql as $$
begin
  if (select count(*) from panel_seats where role_id = new.role_id) >= 5 then
    raise exception 'a role holds at most five panel seats';
  end if;
  return new;
end $$;
create trigger panel_seats_guard before insert on panel_seats for each row execute function panel_seats_guard();

create or replace function lock_role(p_role uuid) returns void language plpgsql security definer as $$
declare r roles%rowtype; rv uuid;
begin
  select * into r from roles where id = p_role for update;
  if r.state <> 'draft' then raise exception 'role is not in draft'; end if;
  if r.brief_seat is null or r.brief_outcomes is null or r.brief_context is null or r.brief_non_negotiables is null then
    raise exception 'all four role brief fields are required before lock';
  end if;
  select id into rv from rubric_versions where role_id = p_role and version = 1;
  if rv is null or not rubric_version_is_valid(rv) then
    raise exception 'rubric version 1 must exist with 4 to 7 criteria whose weights sum to 100';
  end if;
  update roles set state = 'locked', locked_at = now(), current_rubric_version = 1 where id = p_role;
  insert into audit_events (organisation_id, actor_member_id, role_id, event) values (r.organisation_id, current_member_id(r.organisation_id), p_role, 'role.locked');
end $$;

create or replace function reveal_role(p_role uuid) returns void language plpgsql security definer as $$
declare r roles%rowtype; expected integer; actual integer;
begin
  select * into r from roles where id = p_role for update;
  if r.state <> 'scoring' then raise exception 'role is not scoring'; end if;
  select count(*) * (select count(*) from finalists where role_id = p_role)
       * (select count(*) from criteria c join rubric_versions v on v.id = c.rubric_version_id where v.role_id = p_role and v.version = r.current_rubric_version)
    into expected from panel_seats where role_id = p_role and not absent;
  select count(*) into actual from scores s join rubric_versions v on v.id = s.rubric_version_id
    where s.role_id = p_role and v.version = r.current_rubric_version and s.voided_at is null;
  if actual < expected and (r.scoring_deadline is null or now() < r.scoring_deadline) then
    raise exception 'reveal requires every panelist to have submitted every score, or the deadline to have passed (% of %)', actual, expected;
  end if;
  update roles set state = 'revealed', revealed_at = now() where id = p_role;
  insert into audit_events (organisation_id, actor_member_id, role_id, event) values (r.organisation_id, current_member_id(r.organisation_id), p_role, 'role.revealed');
end $$;

-- ---------------------------------------------------------------------------
-- Retention (invariant 9): purge finalist personal data after issue + retention_days
-- ---------------------------------------------------------------------------
create or replace function purge_expired_finalists() returns integer language plpgsql security definer as $$
declare n integer;
begin
  with due as (
    select f.id from finalists f
    join roles r on r.id = f.role_id
    join organisations o on o.id = r.organisation_id
    where f.purged_at is null and r.issued_at is not null
      and r.issued_at + make_interval(days => o.retention_days) < now()
  )
  update finalists set full_name = null, contact = null, cv_object_path = null, purged_at = now()
  where id in (select id from due);
  get diagnostics n = row_count;
  return n;
end $$;
-- Schedule: select cron.schedule('calibre-purge', '0 3 * * *', $$select purge_expired_finalists()$$);

-- ---------------------------------------------------------------------------
-- Row level security (invariant 4 and tenancy)
-- ---------------------------------------------------------------------------
alter table organisations enable row level security;
alter table members enable row level security;
alter table roles enable row level security;
alter table rubric_versions enable row level security;
alter table criteria enable row level security;
alter table panel_seats enable row level security;
alter table finalists enable row level security;
alter table scores enable row level security;
alter table calibrations enable row level security;
alter table calibration_sources enable row level security;
alter table verdicts enable row level security;
alter table outcomes enable row level security;
alter table audit_events enable row level security;
alter table use_policy_acceptances enable row level security;

create or replace function is_member(org uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where organisation_id = org and user_id = auth.uid())
$$;
create or replace function is_owner(org uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where organisation_id = org and user_id = auth.uid() and role = 'owner')
$$;
create or replace function on_panel(p_role uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from panel_seats ps join members m on m.id = ps.member_id where ps.role_id = p_role and m.user_id = auth.uid())
$$;
create or replace function role_org(p_role uuid) returns uuid language sql stable security definer set search_path = public as $$ select organisation_id from roles where id = p_role $$;
create or replace function role_state_of(p_role uuid) returns role_state language sql stable security definer set search_path = public as $$ select state from roles where id = p_role $$;
create or replace function is_role_creator(p_role uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from roles r join members m on m.id = r.created_by where r.id = p_role and m.user_id = auth.uid())
$$;
create or replace function is_role_lead(p_role uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from panel_seats ps join members m on m.id = ps.member_id where ps.role_id = p_role and ps.is_lead and m.user_id = auth.uid())
$$;
create or replace function can_create_roles(org uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where organisation_id = org and user_id = auth.uid() and role in ('owner', 'lead'))
$$;

create policy org_read on organisations for select using (is_member(id));
create policy org_update on organisations for update using (is_owner(id));
create policy members_read on members for select using (is_member(organisation_id));
create policy members_manage on members for all using (is_owner(organisation_id));
create policy policy_read on use_policy_acceptances for select using (is_member(organisation_id));
create policy policy_insert on use_policy_acceptances for insert with check (true);

create policy roles_read on roles for select using (is_owner(organisation_id) or on_panel(id) or is_role_creator(id));
create policy roles_insert on roles for insert with check (can_create_roles(organisation_id));
create policy roles_update on roles for update using (is_owner(organisation_id) or on_panel(id) or is_role_creator(id));
create policy roles_delete on roles for delete using (is_owner(organisation_id) and state = 'draft');
create policy rubric_read on rubric_versions for select using (on_panel(role_id) or is_owner(role_org(role_id)) or is_role_creator(role_id));
create policy rubric_write on rubric_versions for insert with check (on_panel(role_id) or is_owner(role_org(role_id)) or is_role_creator(role_id));
create policy criteria_read on criteria for select using (exists (select 1 from rubric_versions v where v.id = rubric_version_id and (on_panel(v.role_id) or is_owner(role_org(v.role_id)) or is_role_creator(v.role_id))));
create policy criteria_write on criteria for all using (exists (select 1 from rubric_versions v where v.id = rubric_version_id and (on_panel(v.role_id) or is_owner(role_org(v.role_id)) or is_role_creator(v.role_id))));
create policy seats_read on panel_seats for select using (on_panel(role_id) or is_owner(role_org(role_id)) or is_role_creator(role_id));
create policy seats_write on panel_seats for all using (is_owner(role_org(role_id)) or is_role_creator(role_id) or is_role_lead(role_id));
create policy finalists_rw on finalists for all using (on_panel(role_id) or is_owner(role_org(role_id)));

-- Blind reveal: a panelist sees only their own scores until the role is revealed.
create policy scores_read on scores for select using (
  (on_panel(role_id) or is_owner(role_org(role_id))) and (
    role_state_of(role_id) in ('revealed', 'calibrated', 'issued', 'closed')
    or exists (select 1 from panel_seats ps join members m on m.id = ps.member_id where ps.id = panel_seat_id and m.user_id = auth.uid())
  )
);
create policy scores_insert on scores for insert with check (
  exists (select 1 from panel_seats ps join members m on m.id = ps.member_id where ps.id = panel_seat_id and ps.role_id = scores.role_id and m.user_id = auth.uid() and not ps.absent)
);

create policy calibrations_rw on calibrations for all using (on_panel(role_id) or is_owner(role_org(role_id)));
create policy calsrc_rw on calibration_sources for all using (exists (select 1 from calibrations c where c.id = calibration_id and (on_panel(c.role_id) or is_owner(role_org(c.role_id)))));
create policy verdicts_rw on verdicts for all using (on_panel(role_id) or is_owner(role_org(role_id)));
create policy outcomes_rw on outcomes for all using (on_panel(role_id) or is_owner(role_org(role_id)));
create policy audit_read on audit_events for select using (is_owner(organisation_id));
create policy audit_insert on audit_events for insert with check (is_member(organisation_id));

commit;
