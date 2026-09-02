# Calibre as a SaaS: scoping concept

Prepared for Ahmad Al Hinaiti, Founder, Daftar Advisory
Date: 2 September 2026
Status: scoping document, written before any build tool is touched

Sources this document is built on, in order of authority:

1. Deep Research Assessment of the Hiring Decision Service and Calibre Pivot (July 2026)
2. Two Practices, One Buyer: the Daftar and Calibre pivot strategy (July 2026)
3. Calibre Revenue Scenarios, Market Feasibility and Go/No-Go (July 2026)
4. Daftar and Calibre Business Overview (22 July 2026)
5. BRAND.md in the Daftar-Advisory repo, including the Canonical House Strategy note
6. The live Calibre site and deck in the Calibre-by-Daftar repo

Where this document disagrees with those, it says so and why.

---

## 0. Where Calibre stands today

Calibre by Daftar is a hiring decision method sold as a fixed fee service. The method is Read, Score, Compare, Calibrate. The buyable offer, per the Canonical House Strategy, is the **Calibre Verdict**: a done for you hiring decision memo for a finance role, written against a locked scorecard, for a defined shortlist. The label "hiring diagnostic" is retired.

Facts that constrain any SaaS decision:

| Fact | Source |
|---|---|
| Calibre is pre-revenue. No paid pilot has run. | Feasibility study, Business overview |
| Founder capacity for the side practice is 8 to 12 hours per week, asynchronous only. | Pivot strategy |
| KSA delivery is frozen while the founder is employed there. Conflict free markets are Jordan, UAE, non GCC. | Pivot strategy |
| Cash posture is "generate, don't invest". A software build was named as the wrong spend for this period. | Pivot strategy, section 02 |
| The assessment says: do not build software, dashboards, per candidate licensing, or ATS integration around an unvalidated method. | Deep Research, "Activities that must not begin yet" |
| Kill criterion: fewer than 3 paid Verdicts within 12 months of launch ends standalone Calibre marketing. | Pivot strategy, section 09 |
| Calibre's strategic job is to be the one line whose delivery can be separated from the founder's hands: templated, licensed, or run by a second person. | Business overview, section 04 |

The last row is the only reason a SaaS is on the table at all. Software is the "template or licence" path made concrete. The rows above it are the reasons it is not on the table yet.

---

## 1. Pushback

### 1.1 The idea as pitched contradicts your own strategy

Three documents you commissioned in July say the same thing: prove the method with paid, human delivered Verdicts before spending on software. As of today there are zero paid Verdicts. Building a SaaS now is spending against a guess, which is exactly the failure the feasibility study warned about.

The resolution is not "don't build". It is to change what the software is for. **The MVP is not a product sold to strangers. It is the instrument that runs a Verdict**, used first by you with paying clients, so every paid engagement doubles as a product test. That keeps you inside the Attach, Prove, Separate sequence. It also means the first three Verdicts should be run on a spreadsheet and a Word memo before a single line of app code exists. If the spreadsheet version cannot sell, the app will not either.

### 1.2 The target user is vague on the live site

The live site names four personas: HR leaders, talent teams, hiring managers, founders. That is every hiring buyer in every function. The Deep Research assessment is blunt that the founder's authority is in finance, and that a broad talent positioning is the weakest evidence area and the most crowded market (Korn Ferry, SHL, Mercer, Evalufy).

For a SaaS this matters more than for a service, because software cannot borrow your credibility in the room. The target user has to be one person with one job:

**The CFO, finance director, or founder who is about to choose between two to five finalists for a finance seat.**

Everything else, including HR as a user, is deferred until finance role decisions are logged and referenceable.

### 1.3 Scope creep already visible in the material

The following items appear in the site, deck, or earlier strategy and are cut or deferred here:

| Item | Verdict | Why |
|---|---|---|
| Work style or "fit" instrument | Removed | No construct map, no reliability or fairness evidence. Would make the product look like amateur psychometrics. |
| Benchmark dataset across clients | Deferred | Meaningless at solo volume. Keep the outcome register discipline only. |
| Interview question bank generator | Deferred | A static PDF per role template does the job at zero build cost. |
| Recruiter or agency channel | Deferred | Named trigger: ten documented paid decisions with outcomes. |
| Any candidate facing assessment or portal | Out | Triggers PDPL, GDPR Article 22, accessibility and accommodation duties you cannot yet staff. |
| AI scoring, ranking, or recommendation | Out | Recruitment AI is high risk under the EU AI Act and the assessment forbids automated ranking. |
| ATS integration, job posting, sourcing | Out | "Not another ATS" is a stated differentiator. Keep it true. |
| Dashboards and analytics | Cut | Nothing to analyse until there are decisions. |
| Arabic interface | Deferred | Buyers for the first decisions read English. Revisit at the Separate stage. |

---

## 2. Problem statement

**When a finance leader chooses between shortlisted finalists, two capable reviewers reading the same candidate reach different verdicts, and nobody can show afterwards why the decision was made.**

---

## 3. The core user loop

The thing a user does repeatedly is **score a finalist against a locked rubric, see exactly where they diverge from a colleague, and resolve the divergence with written evidence.**

One full cycle, per role:

1. **Lock the role.** The hiring lead writes the role brief and a weighted rubric of four to seven criteria with anchored descriptors. The rubric is frozen with a timestamp before any candidate is entered. Later edits are versioned amendments with a written reason.
2. **Enter finalists.** Two to six named finalists. Optional CV upload. No pipeline, no sourcing.
3. **Score blind.** Each panelist scores every finalist on every criterion, with a mandatory evidence note per score. Nobody sees anyone else's scores until all have submitted or the deadline passes.
4. **See the divergence.** Per candidate and per criterion, the spread across panelists is shown. Gaps above a threshold are flagged. This is the "same CV, two verdicts" screen from your site, made real.
5. **Calibrate.** The panel resolves each flagged gap. Every resolution records a reason. Pre calibration scores are kept as the audit trail.
6. **Issue the Verdict.** The memo is generated from the record: role, rubric, scores before and after, reasons, risks, and a recommendation written by a human in a free text field. Exported in house style.
7. **Log the outcome.** At 90, 180 and 365 days the hiring lead is asked four questions: stayed or left, manager satisfaction, early concerns, and whether the memo flagged what later mattered.

Steps 3 to 5 are the loop. Steps 1, 6 and 7 are the bookends that make it defensible and make it a business.

---

## 4. What the product is, and is not

**Calibre is a panel decision workspace for finance role finalists.** One role, one panel, one locked rubric, one memo.

It is a system of record for a hiring decision, not a system for finding candidates and not a system for testing them.

### Object model

| Object | Holds |
|---|---|
| Workspace | One client organisation. Owner, members, retention setting, signed use policy. |
| Role | Brief, locked rubric (criteria, weights, anchors), lock timestamp, amendments. |
| Panel | Two to five reviewers invited by email. One is the hiring lead. |
| Finalist | Name or initials, optional CV file, candidate notice sent flag. |
| Score | Panelist × finalist × criterion. Value, evidence note, submitted timestamp. Immutable once submitted. |
| Calibration | Per flagged gap: agreed value, written reason, who agreed. |
| Verdict | Generated memo plus the human written recommendation. Versioned. |
| Outcome | 90/180/365 day answers. |
| Audit log | Every read of candidate data, every score, every amendment. |

### Three layers, kept apart

The assessment asked for the architecture to be stated in three layers so that nothing blurs into "assessment".

- **Launch layer** (this document): structured role definition, anchored scorecards, blind panel scoring, calibration, written memo. Human decisions only.
- **Research layer** (not in product): any future instrument work, only if funded and reviewed by an I-O psychologist. Never referenced in the app or marketing.
- **Future assessment layer** (does not exist): only after the research layer produces reliability, fairness and cross cultural evidence.

---

## 5. MVP feature list

The rule for inclusion: the feature is required to complete one paid Verdict through the app with a panel of two, or it is required to keep candidate data lawful. Nothing else.

### Must build

| # | Feature | Why it survives |
|---|---|---|
| 1 | Workspace with email magic link sign in and panel invites | Panelists are one time users. No passwords, no onboarding. |
| 2 | Role brief and rubric builder, starting from two finance templates: Financial Controller and Finance Manager | The assessment names these two as the first packs. Templates make the rubric step ten minutes, not an afternoon. |
| 3 | Rubric lock with timestamp and versioned amendments | Pre locked criteria is the single control that prevents post hoc rationalisation. It is the product's integrity claim. |
| 4 | Finalist entry with optional CV upload | The minimum to score against. |
| 5 | Blind independent scoring with mandatory evidence notes | Blindness and evidence are what make scores comparable. Without them the divergence view is theatre. |
| 6 | Divergence view with threshold flags | The core screen. The thing the site already promises. |
| 7 | Calibration flow with written reasons, preserving pre calibration scores | Turns disagreement into a record. The audit trail is the deliverable. |
| 8 | Verdict memo generation, printable HTML in house style, with a human written recommendation field | The paid output. Human recommendation keeps the decision with the panel, not the software. |
| 9 | Outcome prompts at 90/180/365 days by email | The outcome register was to start with Verdict one. Automating the prompt is the only way it survives a 10 hour week. |
| 10 | Guardrails: candidate notice template, retention auto delete, use policy acknowledgement, audit log | Required by the assessment before any live use. Cheaper to build in than to bolt on. |

### Explicitly not in the MVP

| Feature | Status | Trigger to revisit |
|---|---|---|
| Interview question bank | Deferred | Client asks twice. Ship as a PDF per template first. |
| PDF export via a rendering library | Deferred | Print to PDF from the browser is enough for Verdicts one to five. |
| Self serve checkout and billing | Deferred | Invoice manually from Daftar. Stripe does not onboard Jordan based accounts, so this needs an entity decision anyway. |
| Arabic UI and memo | Deferred | First KSA delivery, which is itself gated on independence. |
| Non finance role templates | Deferred | Five finance decisions logged with outcomes. |
| Agency or multi client mode | Deferred | Ten documented paid decisions. |
| SSO, SAML, enterprise roles | Deferred | First client with more than one workspace. |
| Any LLM in the product, including memo drafting | Deferred | Counsel review of AI Act exposure, and only ever to rephrase the panel's own evidence, never to score. |
| Work style instrument | Removed | Funded psychometric validation programme, reviewed by an I-O psychologist. |
| Candidate portal, tests, video | Out | Not planned. |
| ATS integration, sourcing, scheduling | Out | Not planned. Calibre is not an ATS. |
| Analytics dashboards, cross client benchmarks | Out for now | Volume that does not exist. |

### Prohibited uses, enforced in the product

These come straight from the assessment and are product rules, not policy text:

- No automatic rejection. The app never hides, ranks out, or labels a finalist as rejected.
- No single overall "fit" score. Weighted totals appear only after calibration, labelled advisory.
- No use before shortlist. A role cannot hold more than six finalists.
- No override of demonstrated technical competence without a written job related reason. The memo template has a mandatory field for this when the recommendation departs from the highest scoring finalist.
- No candidate facing assessment of any kind.

---

## 6. Business model

Calibre is priced per decision, not per seat. Hiring is episodic, and per seat pricing would either die between hires or pressure you into becoming an ATS.

| Tier | What the buyer gets | Who does the work | Indicative price | Source of the number |
|---|---|---|---|---|
| Calibre Verdict | Full cycle in the app, plus the memo written by the founder | Founder, 4 to 6 hours | USD 500 to 900 per decision as an attachment; USD 4,500 to 6,500 as a standalone pilot | Pivot strategy section 08; feasibility study section 5 |
| Calibre Panel | The workspace, templates and generated memo, self run by the client panel | Client | To be set after five Verdicts. Working assumption: one third of the Verdict fee | Assumption, untested |

Pricing discipline from the feasibility study still binds: founder hours on Calibre must clear the USD 350 per hour Finance Desk benchmark. The app's job over time is to move hours from the founder column to the client column without the fee falling as fast.

Revenue is invoiced through Daftar Advisory until the Separate stage. No separate entity, no separate bank account, no payment gateway in the MVP.

---

## 7. Recommended stack, with reasoning

The stack is chosen for one builder at 8 to 12 hours per week, who already ships Next.js, and for a product whose core value is an auditable record of personal data. Those two facts drive every choice.

| Layer | Choice | Reasoning |
|---|---|---|
| Framework | Next.js 15, App Router, TypeScript, React 19 | Already the toolchain of the Daftar-Advisory site. One language across marketing site and app. Server Actions remove the need for a separate API layer, which halves the surface a solo builder maintains. |
| Database | Postgres on Supabase | Relational integrity matters when the product is an audit trail. Row Level Security gives multi tenant isolation in the database itself, which is the cheapest safe tenancy model for one developer. Supabase bundles auth and file storage, so CVs, users and data live under one access model. |
| Auth | Supabase Auth, magic links only | Panelists are invited, one off users. No password reset flows to build or support. |
| ORM and migrations | Drizzle | Typed queries, SQL migrations checked into git. Lighter than Prisma and closer to the SQL you will need to read when auditing. |
| Hosting | Vercel for the app | First party Next.js support; Server Actions and edge behaviour work without adapter surprises. Netlify already hosts the marketing sites and can stay there. If you would rather have one vendor, Netlify's Next runtime is acceptable, but expect to spend hours on runtime quirks you would not spend on Vercel. |
| Email | Resend | Magic links, scoring reminders, outcome prompts. Simple API, generous free tier, React email templates share the house type system. |
| UI | Tailwind with tokens lifted from BRAND.md and the existing Calibre UI kit | The house has a strict design system. A component library would fight it. The Calibre kit in the Calibre-by-Daftar repo already defines buttons, cards, stat blocks and segmented controls. |
| Memo output | Server rendered HTML with a print stylesheet | Deterministic, zero dependencies, and the client can print to PDF. Add a PDF renderer only when a client asks for the file by email. |
| Testing | Vitest for scoring and divergence maths; one Playwright script that runs the full loop with two panelists | The loop is the product. One end to end test that proves it is worth more than fifty unit tests. |
| Errors and logs | Sentry free tier, plus the in app audit log table | You need to know when a scoring submit fails silently. The audit log is a product feature, not an ops feature. |

### Data residency

Candidate names, CVs and scores are personal data under the Saudi PDPL, the UAE PDPL and Jordan's Personal Data Protection Law. Start in Supabase's Frankfurt region, because the first markets are Jordan and the UAE and neither prohibits transfer with proper notice and contract terms, but this is counsel's call, not yours or mine. If a client requires regional hosting, Supabase can be self hosted on AWS me-central-1 in the UAE. Design nothing that assumes a single region.

Retention: candidate personal data is deleted automatically a configurable number of days after the Verdict is issued, default 90. Scores and the memo survive with the candidate reduced to initials. This makes the outcome register lawful without keeping CVs for a year.

### Considered and rejected

| Option | Why not |
|---|---|
| Firebase or Firestore | Weak relational and audit story. Security rules are harder to reason about than RLS for a one person team. |
| Separate backend (Django, Rails, NestJS) | Doubles the deploy surface and the language count. Nothing in the MVP needs it. |
| No code (Airtable, Bubble, Softr) | Tenancy, retention deletion and the audit trail are the product. No code tools make exactly those parts opaque. |
| Any LLM call in the scoring or memo path | Recruitment AI is high risk under the EU AI Act; the assessment forbids automated ranking; and buyers will ask for validation evidence you cannot give. |
| Mobile app | Panelists score from a laptop with a CV open. Responsive web only. |

---

## 8. What to do before touching a build tool

The assessment's 30 day "minimum pack" is the paper prototype of this SaaS. Complete it first.

1. **Run two Verdicts by hand.** A spreadsheet for the rubric and blind scores, a Word memo in house style. Use a live finance hire inside an existing Daftar relationship in Jordan or the UAE. Time every step. This produces the real rubric templates and the real memo template the app will encode.
2. **Get a counsel note** on candidate notice, lawful basis and retention for Jordan and the UAE. One page. It sets the guardrail defaults.
3. **Write the allowed and prohibited use policy** as a one page document. It becomes the acknowledgement screen.
4. **Open the outcome register** as a spreadsheet. The app will import it.
5. **Strip the live site** to one page, one offer, one price, per the pivot strategy weeks 6 to 8. Replace "hiring diagnostic" with "Calibre Verdict" everywhere and either source or remove the "Δ 41 pts" figure.

Only after step 1 has been sold twice does the build begin.

---

## 9. Build sequence, once it begins

At ten productive hours a week the MVP is roughly twelve weeks. Order it so that a paid Verdict can run through the app as early as possible.

| Weeks | Build | Proves |
|---|---|---|
| 1 to 2 | Workspace, magic link auth, panel invites, database schema with RLS | Tenancy and access are right before any data exists. |
| 3 to 4 | Role brief, rubric builder from the two templates, lock and amendments | The integrity claim. |
| 5 to 6 | Finalists, blind scoring with evidence notes | Half the loop. Run Verdict three here, with you as one panelist. |
| 7 to 8 | Divergence view, calibration with reasons | The whole loop. Run Verdict four fully in the app. |
| 9 to 10 | Memo generation in house style, outcome prompts | The paid output and the register. |
| 11 to 12 | Guardrails, retention deletion, audit log review, Playwright loop test | Safe to hand to a client panel without you present. |

---

## 10. Success metrics and kill criteria

Carried over from your existing documents, with the software added.

| Metric | Target | Consequence of missing it |
|---|---|---|
| Paid Verdicts in the first 6 months after the manual pack is ready | 3 or more | Fewer: stop the build, keep the Verdict as an unadvertised Daftar line item. |
| Paid Verdicts in 12 months | Enough to hit the pivot strategy threshold of 3, and at least 2 run through the app by a client panel without you scoring | Fewer: no Separate stage, no Calibre Panel tier. |
| Founder hours per Verdict | Falling from 6 toward 2 by Verdict ten | Flat: the software is not doing its job of separating delivery from your hands. |
| Outcome register completeness | Every Verdict has 90 day data | Gaps: do not scale, per the assessment. |
| Conflict or privacy incident | Zero | One: stop, per the pivot strategy. |
| Buyer asks for psychometric validation | Rare | Repeated: the market is pulling Calibre into a category it must not enter. Reposition or stop. |

---

## 11. Open decisions for the founder

These change the work materially and only you can settle them.

1. **Is the software allowed to start before three paid manual Verdicts?** This document says no. If you overrule it, say so in writing so the decision is recorded.
2. **Entity and invoicing.** Daftar invoices until Separate. Confirm, because it decides whether billing is ever in scope.
3. **Data region.** Frankfurt by default, pending counsel. Confirm or redirect.
4. **The "Δ 41 pts" figure on the live site.** Source it or remove it. The brand file flags it as unsourced.
5. **Whether "Calibre Panel" self serve is a goal at all**, or whether Calibre stays a founder delivered Verdict with software behind it. The MVP is the same either way, which is why the decision can wait, but the Separate stage cannot start without it.
