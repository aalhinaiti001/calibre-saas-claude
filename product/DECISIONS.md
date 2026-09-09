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
