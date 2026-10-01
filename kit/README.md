# Calibre service kit

The documents a Calibre Verdict engagement runs on. One product, one tier: the Calibre Verdict with panel calibration included (DEC-2026-02). Everything here implements [`product/METHOD.md`](../product/METHOD.md) and [`product/GUARDRAILS.md`](../product/GUARDRAILS.md), and is set in the Calibre brand ([`brand/HANDBOOK.html`](../brand/HANDBOOK.html)).

| File | Use |
|---|---|
| [Calibre_Rate_Card.docx](Calibre_Rate_Card.docx) | The private rate card. USD 5,500 fixed, 50% on criteria lock, 50% on delivery of the written Verdict. |
| [Calibre_Role_Intake_and_Criteria_Lock.docx](Calibre_Role_Intake_and_Criteria_Lock.docx) | Completed on the intake call. Role brief, panel, criteria, evidence, the signed lock, the shortlist register, candidate notice and use-policy acceptance. |
| [Calibre_Verdict_Memo_Template.docx](Calibre_Verdict_Memo_Template.docx) | The Verdict, in METHOD.md §7's ten sections. |
| [Calibre_Verdict_Working_File.xlsx](Calibre_Verdict_Working_File.xlsx) | One workbook per engagement: setup, rubric, blind panel scores, divergence, calibration, results, outcome register. |
| [Calibre_Service_Definition.docx](Calibre_Service_Definition.docx) | What the Verdict is and is not: boundary, method, safeguards, delivery gates, commercial discipline. |
| [Calibre_Panel_Scoring_Guide.docx](Calibre_Panel_Scoring_Guide.docx) | Given to each panelist before scoring: the 0 to 5 scale, evidence-note rules, the submission record, the reveal rule. |
| [Calibre_Calibration_Record.docx](Calibre_Calibration_Record.docx) | Kept during the calibration session: flagged cells, cause, resolution, scores after calibration, completion check. |
| [Calibre_Candidate_Notice_and_Data_Record.docx](Calibre_Candidate_Notice_and_Data_Record.docx) | The notice template the client sends each finalist, the notice and adjustment records, and the purge record. |
| [Calibre_Engagement_Time_Log.xlsx](Calibre_Engagement_Time_Log.xlsx) | **Internal, never sent to a client.** All-in founder hours against budget, the fee tested against the USD 350 hurdle, and the engagement register. |

Set in Lora and Plus Jakarta Sans, both free under the SIL Open Font License. Install them on any machine that opens these files, or Word and Excel substitute another face.

## What this replaces

The five service-delivery files in `latest-research/.../06_Calibre (by Daftar)/02_Service-delivery-kit/`, reviewed 30 September 2026, and the four companion documents in `latest-research/Desktop/Calibre/` (commit `08a560d`). They are superseded for client use and have not been changed there.

| Issue in the old kit | Resolution here |
|---|---|
| Two tiers, a USD 4,500 solo read and a USD 6,500 panel upgrade | One rate card, one product, calibration included |
| The panel card's steps described a solo review | Steps rewritten around independent panel scoring, reveal and calibration |
| Intake offered two packages; memo said to delete the panel chapter | One package; divergence and calibration are the memo's spine (sections 04 to 06) |
| Working file scored with one reader, panel "package only" | Rebuilt: up to five panelists score blind on sheet 02; calibration is mandatory on sheet 04 |
| Nine default criteria against METHOD.md's cap of seven | METHOD.md and the schema raised to 4 to 9 (founder decision, 30 Sep 2026); the nine-criterion default is kept |
| Outcome check "at six months", with a live `[VERIFY]` | 90, 180 and 365 days with METHOD.md §8's four questions |
| Weighted total on a 0 to 5 scale, counting "no evidence" as a low score | METHOD.md §6: calibrated scores, 0 to 100, advisory, footnoted incomplete where evidence is missing |
| Spread computed including zeros; no divergence/contradiction split | Zeros excluded from spread and mean; spread 2 is a divergence, 3 or 4 a contradiction |
| No calibrated score or reason columns; raw average | Agreed score and written reason per flagged cell; unresolved cells keep the mean, rounded with ties down; originals untouched |
| Four interviewers and four candidates at most | Five panelists and six finalists (METHOD.md §1); four finalists in the fee, a fifth or sixth quoted |
| No rule on departing from the weighted result | Memo section 08 requires a written job-related reason; the working file names the finalist with the highest weighted result for this check only |
| Intake missing non-negotiables, panel, scoring deadline, candidate notice, use policy | All added |
| Evidence notes of any length | Validation requires at least 40 characters |
| Styled as Daftar: Cormorant, Inter, JetBrains Mono, cream, camel, rust | Calibre only: white ground, forest green, Lora and Plus Jakarta Sans, no monospace |
| Use statement missing from rate cards and memo | All four sentences on every document |
| Three `[VERIFY]` flags per rate card | Closed: payment 50/50, invoiced in USD with SAR or AED on request, data handling per GUARDRAILS.md §5 |
| Comparison sheet read unscored cells as "No evidence" | Every derived cell is blank until something is entered; checked in the verification below |
| Companion documents stated four to seven criteria | Service Definition, Panel Scoring Guide, Calibration Record and Candidate Notice rebuilt here: four to nine criteria, USD 5,500, 50/50, Calibre brand |
| Two time logs, a solo log and a panel log, each with its own fee and hour cap | One log for the one product, at USD 5,500; the management hour cap is left blank until the founder sets one |

Kept from the old kit because they were the strongest parts: the nine anchor definitions, the evidence-basis labels (Documented, Interview-stated, Inferred, None), the intake stop rule, the memo's standing limits paragraph, "What this Verdict cannot tell you", and fixed candidate order.

## Verification

- All seven Word files pass the Office Open XML schema validation, and each was rendered and checked page by page.
- The working file has 1,208 formulas and recalculates with zero errors. Two filled test scenarios, checked against hand-computed answers, passed 55 of 55: flags, zero exclusion, ties rounding down, calibrated and unresolved finals, reason-missing and misplaced-entry checks, reviewer agreement, weighted results for nine and seven criteria, and the rubric lock messages.
- The time log has 75 formulas and recalculates with zero errors. The blank template and two filled scenarios passed 48 of 48: budget and actual totals, blanks until entered, effective rate, hurdle headroom, the cap left blank and set, the hurdle test at budget and at actual, and the register's per-engagement and blended rates.
- Claim gate (brand handbook §04): every hit for rank, fit, predict, valid and assessment is a negation, a prohibition, the use statement, the scoring guide's labelled example of an insufficient note, or "assessment" in its tax sense. No Daftar face or colour appears in any file.

## Rebuilding

The nine files are generated. Edit the builders, not the outputs.

```bash
cd kit/build && npm install
node build_docs.js ..                     # the seven Word documents
python3 build_working_file.py             # the working file
python3 build_time_log.py                 # the time log
```

Recalculate both workbooks in LibreOffice or Excel after building, so cached values exist.

[`build/default-finance-rubric.json`](build/default-finance-rubric.json) holds the nine default criteria, weights and anchors.

## Open

1. **The budget already fails the hurdle.** The time log carries the earlier panel budgets: 15.75 all-in hours against the 15.71 the fee buys at USD 350, before any selling or admin time, and with no budget for the live readout (the solo log carried an hour for it). Decide which of three moves to make: a tighter scope, a higher fee, or a management hour cap the delivery has to meet. Log actual hours from the first Verdict either way.
2. **Superseded copies, outside this repo.** The five old kit files, the four companion documents, CAL/01 and the two old rate cards remain unmarked in `latest-research`. Held until that archive's open pull request is cleaned up; the founder decides when to mark them.
