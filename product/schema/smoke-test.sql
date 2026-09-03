\set ON_ERROR_STOP on
\set QUIET on
-- users
\set owner '11111111-1111-1111-1111-111111111111'
\set lead  '22222222-2222-2222-2222-222222222222'
\set pan   '33333333-3333-3333-3333-333333333333'
-- superuser setup of org, policy, members (app onboarding runs as service role)
insert into organisations (id, name) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Test Co');
insert into use_policy_acceptances (organisation_id, accepted_by_user, policy_version) values ('aaaaaaaa-0000-0000-0000-000000000001', :'owner', '1.0');
insert into members (id, organisation_id, user_id, email, display_name, initials, role) values
 ('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',:'owner','o@t.co','Owner','OW','owner'),
 ('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000001',:'lead','l@t.co','Lead','LD','lead'),
 ('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000001',:'pan','p@t.co','Panelist','PN','panelist');
set role app;
select set_config('app.uid', :'lead', false);
insert into roles (id, organisation_id, title, created_by, brief_seat, brief_outcomes, brief_context, brief_non_negotiables, scoring_deadline)
 values ('cccccccc-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Financial Controller','bbbbbbbb-0000-0000-0000-000000000002','seat','outcomes','context','CPA', now() + interval '7 days');
insert into panel_seats (id, role_id, member_id, is_lead) values
 ('dddddddd-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000002', true),
 ('dddddddd-0000-0000-0000-000000000002','cccccccc-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000003', false);
-- invariant 1: finalist before lock must fail
do $$ begin
  insert into finalists (role_id, ref, initials) values ('cccccccc-0000-0000-0000-000000000001','F1','AB');
  raise exception 'FAIL: finalist accepted before lock';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok: finalist refused before lock (%)', sqlerrm; end $$;
insert into rubric_versions (id, role_id, version, created_by) values ('eeeeeeee-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001',1,'bbbbbbbb-0000-0000-0000-000000000002');
-- weights 30+30+40 with only 3 criteria: lock must fail
insert into criteria (rubric_version_id, position, key, name, weight, anchor_1, anchor_3, anchor_5) values
 ('eeeeeeee-0000-0000-0000-000000000001',1,'a','A',30,'1','3','5'),
 ('eeeeeeee-0000-0000-0000-000000000001',2,'b','B',30,'1','3','5'),
 ('eeeeeeee-0000-0000-0000-000000000001',3,'c','C',40,'1','3','5');
do $$ begin perform lock_role('cccccccc-0000-0000-0000-000000000001'); raise exception 'FAIL: locked with 3 criteria';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok: lock refused with 3 criteria'; end $$;
update criteria set weight = 20 where key in ('a','b'); update criteria set weight = 30 where key = 'c';
insert into criteria (rubric_version_id, position, key, name, weight, anchor_1, anchor_3, anchor_5) values ('eeeeeeee-0000-0000-0000-000000000001',4,'d','D',30,'1','3','5');
select lock_role('cccccccc-0000-0000-0000-000000000001');
insert into finalists (id, role_id, ref, initials, full_name, contact) values
 ('ffffffff-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001','F1','AB','Alice B','alice@x'),
 ('ffffffff-0000-0000-0000-000000000002','cccccccc-0000-0000-0000-000000000001','F2','CD','Carl D','carl@x');
-- lead scores everything
insert into scores (role_id, rubric_version_id, panel_seat_id, finalist_id, criterion_id, value, evidence_note)
 select 'cccccccc-0000-0000-0000-000000000001','eeeeeeee-0000-0000-0000-000000000001','dddddddd-0000-0000-0000-000000000001', f.id, c.id,
        case when f.ref='F1' then 4 else 2 end, 'Interview: described the FY24 close and the elimination entries in detail without prompting.'
 from finalists f cross join criteria c where f.role_id='cccccccc-0000-0000-0000-000000000001';
-- immutability
do $$ declare n int; begin update scores set value = 5 where panel_seat_id='dddddddd-0000-0000-0000-000000000001'; get diagnostics n = row_count; if n > 0 then raise exception 'FAIL: score edited (% rows)', n; end if; raise notice 'ok: score edit blocked by RLS (0 rows)';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok: score edit refused by trigger'; end $$;
-- blind: panelist cannot see lead's scores yet
select set_config('app.uid', :'pan', false);
do $$ declare n int; begin select count(*) into n from scores; if n <> 0 then raise exception 'FAIL: panelist saw % scores before reveal', n; end if; raise notice 'ok: blind before reveal'; end $$;
-- reveal must fail (panelist has not scored)
do $$ begin perform reveal_role('cccccccc-0000-0000-0000-000000000001'); raise exception 'FAIL: revealed early';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok: reveal refused (%)', sqlerrm; end $$;
insert into scores (role_id, rubric_version_id, panel_seat_id, finalist_id, criterion_id, value, evidence_note)
 select 'cccccccc-0000-0000-0000-000000000001','eeeeeeee-0000-0000-0000-000000000001','dddddddd-0000-0000-0000-000000000002', f.id, c.id,
        case when f.ref='F1' and c.key='a' then 1 when f.ref='F1' then 4 else 3 end, 'CV and interview: the consolidation example was thin and the candidate could not name the standard applied.'
 from finalists f cross join criteria c where f.role_id='cccccccc-0000-0000-0000-000000000001';
select reveal_role('cccccccc-0000-0000-0000-000000000001');
do $$ declare n int; begin select count(*) into n from scores; if n <> 16 then raise exception 'FAIL: expected 16 visible scores after reveal, got %', n; end if; raise notice 'ok: all 16 scores visible after reveal'; end $$;
-- divergence on F1/a: lead 4, panelist 1 -> spread 3
select f.ref, c.key, max(s.value)-min(s.value) as spread from scores s join finalists f on f.id=s.finalist_id join criteria c on c.id=s.criterion_id group by 1,2 having max(s.value)-min(s.value) >= 2;
-- calibrate every cell (superuser shortcut for brevity: as lead)
select set_config('app.uid', :'lead', false);
begin;
insert into calibrations (id, role_id, finalist_id, criterion_id, value, reason, recorded_by)
 select gen_random_uuid(), 'cccccccc-0000-0000-0000-000000000001', f.id, c.id, round(avg(s.value))::int, 'Panel agreed after reading both evidence notes; the interview transcript settled it.', 'bbbbbbbb-0000-0000-0000-000000000002'
 from scores s join finalists f on f.id=s.finalist_id join criteria c on c.id=s.criterion_id group by f.id, c.id;
insert into calibration_sources select cal.id, s.id from calibrations cal join scores s on s.finalist_id=cal.finalist_id and s.criterion_id=cal.criterion_id;
commit;
update roles set state='calibrated' where id='cccccccc-0000-0000-0000-000000000001';
select f.ref, weighted_result('cccccccc-0000-0000-0000-000000000001', f.id) as result from finalists f order by f.created_at;
-- recommending the lower finalist without a reason must fail
do $$ begin
 insert into verdicts (role_id, recommended_finalist_id, recommendation, generated_sections, issued_by)
 values ('cccccccc-0000-0000-0000-000000000001','ffffffff-0000-0000-0000-000000000002', repeat('x',120), '{}', 'bbbbbbbb-0000-0000-0000-000000000002');
 raise exception 'FAIL: departure accepted without reason';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok: departure refused (%)', sqlerrm; end $$;
insert into verdicts (role_id, recommended_finalist_id, recommendation, departure_reason, generated_sections, issued_by)
 values ('cccccccc-0000-0000-0000-000000000001','ffffffff-0000-0000-0000-000000000002', repeat('x',120), 'F2 holds the CPA and the non negotiable was verified; F1 does not, which is a job related requirement stated in the brief.', '{}', 'bbbbbbbb-0000-0000-0000-000000000002');
select state, issued_at is not null as issued from roles where id='cccccccc-0000-0000-0000-000000000001';
-- retention: backdate issue and purge
reset role;
update roles set issued_at = now() - interval '91 days' where id='cccccccc-0000-0000-0000-000000000001';
select purge_expired_finalists() as purged;
select ref, initials, full_name, contact, purged_at is not null as purged from finalists order by ref;
select count(*) as audit_events from audit_events;
-- immutability as superuser (service role): trigger must refuse
do $$ begin update scores set value = 5 where value = 4; raise exception 'FAIL: superuser edited a score';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok: superuser score edit refused by trigger (%)', sqlerrm; end $$;
do $$ begin delete from audit_events; raise exception 'FAIL: audit deleted';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok: audit delete refused'; end $$;
