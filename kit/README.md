# Calibre service kit

The documents a Calibre Verdict engagement runs on. One product, one tier: the Calibre Verdict with panel calibration included (DEC-2026-02). Everything here implements [`product/METHOD.md`](../product/METHOD.md) and [`product/GUARDRAILS.md`](../product/GUARDRAILS.md), and is set in the Calibre brand ([`brand/HANDBOOK.html`](../brand/HANDBOOK.html)).

| File | Use |
|---|---|
| [Calibre_Rate_Card.docx](Calibre_Rate_Card.docx) | The private rate card. USD 5,500 fixed, 50% on criteria lock, 50% on delivery of the written Verdict. |
| [Calibre_Role_Intake_and_Criteria_Lock.docx](Calibre_Role_Intake_and_Criteria_Lock.docx) | Completed on the intake call. Role brief, panel, criteria, evidence, the signed lock, the shortlist register, candidate notice and use-policy acceptance. |
| [Calibre_Verdict_Memo_Template.docx](Calibre_Verdict_Memo_Template.docx) | The Verdict, in METHOD.md §7's ten sections. |
| [Calibre_Verdict_Working_File.xlsx](Calibre_Verdict_Working_File.xlsx) | One workbook per engagement: setup, rubric, blind panel scores, divergence, calibration, results, outcome register. |

Set in Lora and Plus Jakarta Sans, both free under the SIL Open Font License. Install them on any machine that opens these files, or Word and Excel substitute another face.

## What this replaces

The five service-delivery files in `latest-research/.../06_Calibre (by Daftar)/02_Service-delivery-kit/`, reviewed 30 September 2026. They are superseded for client use and have not been changed there.

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

Kept from the old kit because they were the strongest parts: the nine anchor definitions, the evidence-basis labels (Documented, Interview-stated, Inferred, None), the intake stop rule, the memo's standing limits paragraph, "What this Verdict cannot tell you", and fixed candidate order.

## Verification

- All three Word files pass the Office Open XML schema validation.
- The working file has 1,208 formulas and recalculates with zero errors.
- Two filled test scenarios, checked against hand-computed answers, passed 55 of 55: flags, zero exclusion, ties rounding down, calibrated and unresolved finals, reason-missing and misplaced-entry checks, reviewer agreement, weighted results for nine and seven criteria, and the rubric lock messages.
- Claim gate (brand handbook §04): every hit for rank, fit, predict and assessment is a negation or the use statement.

## Rebuilding

The four files are generated. Edit the builders, not the outputs.

```bash
cd kit/build && npm install
node build_docs.js ..                     # the three Word documents
python3 build_working_file.py             # the workbook, then recalculate it in LibreOffice or Excel
```

[`build/default-finance-rubric.json`](build/default-finance-rubric.json) holds the nine default criteria, weights and anchors used by all four files.

## Open

1. **Companion documents not yet in this repo.** The intake form points to the Calibre Candidate Notice and Data Record. It, the Panel Scoring Guide, the Calibration Record and the Service Definition exist only in `latest-research/Desktop/Calibre/` (commit `08a560d`), and all four still state four to seven criteria. Bring them in and restyle them, or retire them.
2. **The hurdle.** At USD 5,500 and the USD 350 D/01 benchmark, a Verdict must land inside about 15.7 all-in founder hours, including intake, calibration and readout. CAL/01 estimated about 18 for panel delivery. Log all-in hours from the first Verdict.
3. **Superseded copies.** The five old kit files, CAL/01 and the two old rate cards remain in `latest-research` unmarked.
