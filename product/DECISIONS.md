# Decisions

Architecture decision records first, founder decision log second. Each ADR is short by design: context, decision, consequence.

## ADR 001: The method is the product, software is one delivery form

**Context.** Calibre can be delivered by hand, as a licensed kit, or as software. The July 2026 strategy work fixed its strategic job as being separable from the founder's hands.
**Decision.** METHOD.md is the normative artefact. The kit and the app implement it. No feature exists in software that has no counterpart in the manual method.
**Consequence.** Every product change starts as a change to METHOD.md. The first three Verdicts run on the manual pack and validate the method before any app code.

## ADR 002: No algorithm produces, suggests, or adjusts a score

**Context.** Recruitment AI is high risk under the EU AI Act. The deep research assessment forbids automated ranking. Buyers would demand validation evidence Calibre cannot give.
**Decision.** Every score value is entered by a named human. The product computes spreads, means, and weighted results from human entries and nothing else. No language model touches the decision path, including memo drafting, until counsel reviews a specific bounded use.
**Consequence.** Invariant 12 in the domain model. The stack has no model dependency. The memo's generated sections are templated, not generated.

## ADR 003: Blind reveal is enforced in the database

**Context.** Independence of panelists is what makes divergence meaningful. An interface rule can be bypassed by an API call or a curious owner.
**Decision.** Row level security hides other panelists' scores until the role reaches revealed state. The reveal function checks completeness or deadline before changing state.
**Consequence.** The owner role sees scores only after reveal, like everyone else. Support access is by the service role and is audited.

## ADR 004: Postgres with row level security for tenancy, one region per deployment

**Context.** One builder at 8 to 12 hours a week. Candidate personal data under Saudi, UAE and Jordan data protection law. Clients may require regional hosting.
**Decision.** One Postgres database per deployment, organisations isolated by RLS, no cross organisation queries. Frankfurt by default. A client requiring residency gets a separate deployment, not a flag.
**Consequence.** No benchmarks across clients without a separate consented data model. Deployment is a template, not a platform.

## ADR 005: Per decision pricing, invoiced by Daftar

**Context.** Hiring is episodic. Per seat pricing dies between hires or pushes the product toward an ATS. Stripe does not onboard Jordan based accounts.
**Decision.** Calibre is priced per role. Daftar Advisory invoices until the Separate stage. No payment gateway in the product.
**Consequence.** No billing code. Commercial terms live in the engagement letter.

## ADR 006: Immutable scores, versioned rubrics, append only audit

**Context.** The product's value is a defensible record. A record that can be edited after the fact is not one.
**Decision.** Submitted scores cannot be updated or deleted. Rubric changes create versions. Changes that would invalidate scores void them visibly rather than editing them. The audit table is append only.
**Consequence.** Storage grows and never shrinks except for the retention purge of personal data, which nulls fields rather than deleting rows.

## ADR 007: Finalist personal data purged by default at 90 days

**Context.** The outcome register must run for a year. Keeping CVs for a year is unnecessary and raises exposure.
**Decision.** Name, contact and CV are nulled at organisation retention days after issue, default 90, configurable 30 to 365. Initials, ref, scores, calibrations, verdict and outcomes remain.
**Consequence.** The memo and register are pseudonymous after purge. Access requests after purge return scores by initials only.

---

## Founder decision log

| Date | Decision | Effect |
|---|---|---|
| 2 Sep 2026 | The SaaS scoping concept and the non software alternatives are recorded in the repo. | docs/ holds both, plus the Word edition. |
| 2 Sep 2026 | Founder directed product design to begin before three paid Verdicts have run. | Fundamentals (method, domain model, guardrails, role packs, memo, schema) are written now. They double as the manual pack for the first Verdicts. The gate on application code remains as stated in the SaaS concept: no app build before the method has been sold twice by hand. |
| 2 Sep 2026 | The website reflects the positioning, not the product concept. | Applied 9 Sep 2026 to the canonical English and Arabic pages at `daftaradvisory.com/calibre`: replaced "hiring diagnostic" with "Calibre Verdict", narrowed the audience to the finance leader choosing between finalists, removed the unsourced gap figure, and made no claim about software or a kit. |
| 23 Sep 2026 | Unified Master Brand Playbook & Handbook v2.0-Canon issued, superseding Brand Handbook v1.0 and Playbook editions 01–02. Adopted on merge, 27 Sep 2026. | Merged into [`brand/HANDBOOK.html`](../brand/HANDBOOK.html) as the brand canon for the Calibre surface. METHOD.md and GUARDRAILS.md still outrank it on claims. Corrections applied on merge are listed in [`brand/README.md`](../brand/README.md). |
| 23 Sep 2026 | DEC-2026-02: Calibre sells one complete Verdict with full panel calibration. The solo-reviewer tier is prohibited from collateral. Adopted on merge, 27 Sep 2026. | Resolves the conflict between the Service Definition (calibration is not optional) and CAL/01's two tiers. The USD 4,500 solo-read tier in CAL/01 (10 Sep 2026) and its rate card are superseded for client use. Scope is one role, two weeks, fixed fee, with calibration included, as METHOD.md §1 requires. |
| 23 Sep 2026 | DEC-2026-01: inbound contact stays `ahmad@daftaradvisory.com` until `hello@calibre.daftaradvisory.com` mail routing is verified. Adopted on merge, 27 Sep 2026. | Both live language pages and the Guided v2 source already comply. |
| 27 Sep 2026 | Founder directed the Unified Handbook and the Guided v2 design to be merged into this repo, Calibre only. | Guided v2 is held in [`brand/site/`](../brand/site/) as a design source, not shipped. Release is blocked on an Arabic mirror, a static export, and the open items in [`brand/README.md`](../brand/README.md). Daftar-Advisory is unchanged. |
| 30 Sep 2026 | The criteria cap is raised from seven to nine. | METHOD.md §1 and the schema (criterion position, lock and issue checks) now allow 4 to 9 criteria; the smoke test proves nine are accepted and a tenth refused. The kit's nine-criterion default finance rubric is kept. |
| 30 Sep 2026 | One rate card: the Calibre Verdict at USD 5,500 fixed, panel calibration included, 50% on criteria lock and 50% on delivery of the written Verdict. | Replaces the USD 4,500 solo card and the USD 6,500 panel card. At the USD 350 D/01 hurdle the fee covers about 15.7 all-in founder hours, below CAL/01's estimate of about 18 for panel delivery; all-in hours are logged from the first Verdict. |
| 30 Sep 2026 | The canonical service kit lives in [`kit/`](../kit/README.md). | Rate card, intake and criteria lock, Verdict memo template and working file, rebuilt on METHOD.md in the Calibre brand. Supersedes the five service-delivery files in the latest-research archive. |
| 1 Oct 2026 | Founder directed the kit's open issues fixed before merge. | The four companion documents (service definition, panel scoring guide, calibration record, candidate notice and data record) rebuilt in `kit/` at four to nine criteria. One internal time log replaces the solo and panel logs; its budget of 15.75 hours already exceeds the 15.71 the fee buys at the hurdle, which is left open for a founder decision. The schema now refuses a score or calibration that points across roles or rubric versions. |
