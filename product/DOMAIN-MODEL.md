# Domain model

Version 1.0. Entities, states, and invariants. The schema in schema/schema.sql implements this file.

## Entities

| Entity | Meaning | Owned by |
|---|---|---|
| Organisation | One client. The tenancy boundary. | Itself |
| Member | A person's membership of an organisation, with a role: owner, lead, or panelist. | Organisation |
| Role | One hiring decision. The unit Calibre is priced on. | Organisation |
| Rubric version | An immutable snapshot of the criteria for a role. A new version is created on lock and on each amendment. | Role |
| Criterion | One line of a rubric version: name, weight, anchors, evidence sources, questions. | Rubric version |
| Panel seat | A member's participation in a role's panel, with the hiring lead flagged. | Role |
| Finalist | One shortlisted candidate. Personal data lives here and only here. | Role |
| Score | One panelist's score for one finalist on one criterion under one rubric version. Immutable once submitted. | Panel seat |
| Calibration | The agreed score and reason for one finalist on one criterion. References the scores it resolves. | Role |
| Verdict | The issued memo: generated sections plus the human recommendation. Versioned. | Role |
| Outcome | The 90, 180 or 365 day answers for a role. | Role |
| Audit event | An append only record of every state change and every read of finalist data. | Organisation |
| Use policy acceptance | The owner's signed acknowledgement of allowed and prohibited uses. | Organisation |

## Role lifecycle

```
draft ──lock──▶ locked ──first finalist──▶ populating ──first score──▶ scoring
scoring ──all submitted or deadline──▶ revealed ──calibration complete──▶ calibrated
calibrated ──memo issued──▶ issued ──365 day outcome or manual close──▶ closed
```

| State | What is allowed | What is refused |
|---|---|---|
| draft | Edit brief, edit rubric | Add finalists, invite panel beyond the lead |
| locked | Amend rubric with reason (new version), add finalists, invite panel | Scores |
| populating | Same as locked | Reveal |
| scoring | Submit scores. Amend rubric only by re-versioning, which voids scores. | Add or remove finalists, edit submitted scores |
| revealed | View all scores, run calibration | New scores, late panelists |
| calibrated | Write recommendation, issue memo | Edit calibrations after issue |
| issued | Record outcomes, re-issue memo as a new version with a reason | Anything that changes scores or rubric |
| closed | Read only | Everything else |

## Invariants

These hold in every state and are enforced in the database, not only in the interface.

1. A finalist cannot exist for a role in draft state.
2. A score cannot reference a rubric version other than the role's current version at the time of submission.
3. A submitted score is never updated or deleted. Voiding is a new event that marks it void and keeps it.
4. No member can read another panel seat's scores for a role until that role is in revealed state or later.
5. A calibration must reference at least two scores for the same finalist and criterion, and must carry a reason of at least one sentence.
6. A verdict cannot be issued while any criterion has weight zero, while weights do not sum to 100, or while the recommendation field is empty.
7. If the recommended finalist is not the finalist with the highest weighted result, the departure reason is mandatory and non empty.
8. A role holds at most six finalists and at most five panel seats.
9. Finalist personal data (name, contact, CV file) is deleted by the retention job at the organisation's configured interval after issue, default 90 days. Initials, scores, calibrations, verdicts and outcomes remain.
10. Every read of a finalist's personal data by any member writes an audit event.
11. No organisation can be created without a use policy acceptance recorded first.
12. Nothing in the system computes a score. Every score value is entered by a named human.

## What is deliberately not modelled

- Candidates as people who exist across roles. A finalist belongs to exactly one role. Calibre holds no candidate profiles and no talent pool.
- Job postings, applications, pipeline stages, interview scheduling. Calibre is not an ATS.
- Any attribute of a finalist other than what the panel wrote down: no demographics, no personality fields, no test results.
- Cross organisation aggregates. Benchmarks are deferred and would require a separate, consented data model.
