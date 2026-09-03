# The Calibre method

Version 1.0, 2 September 2026. This is the normative specification. Where the app, the kit, or a memo disagrees with this file, this file wins.

Calibre is structured hiring advisory for finance roles. It is not a psychometric assessment, not a predictor of performance, and not a screening tool. It makes a panel's judgment explicit, comparable, and defensible. The four moves are Read, Score, Compare, Calibrate.

---

## 1. Scope of one Verdict

One Verdict covers one role, one panel, one locked rubric, and a shortlist of two to six finalists. It begins after the shortlist exists and ends when the memo is issued. Calibre is never used before shortlist.

| Bound | Rule |
|---|---|
| Finalists | Minimum 2, maximum 6 |
| Panelists | Minimum 2, maximum 5. One is the hiring lead. |
| Criteria | Minimum 4, maximum 7 |
| Weights | Integers, sum to exactly 100 |

---

## 2. Read: the role brief and the rubric

### 2.1 The role brief

Written by the hiring lead before any finalist is entered. Four fields, each mandatory:

1. **Seat.** Title, reporting line, team size, entity scope, location.
2. **First year outcomes.** Three to five things that must be true twelve months in.
3. **Context that makes this hire hard.** First year under IFRS, audit findings open, IPO preparation, ERP change, a departing incumbent, and so on.
4. **Non negotiables.** Requirements that are job related and verifiable: qualification, language, right to work. Nothing about personality, age, family status, or health.

### 2.2 The rubric

A rubric is a set of criteria. Each criterion has:

| Field | Rule |
|---|---|
| Name | Short, a competence not a trait. "Close and consolidation ownership", not "Drive". |
| Weight | Integer share of 100. |
| Anchor 1 | What a clearly insufficient answer or record looks like. |
| Anchor 3 | What an adequate, hireable level looks like. |
| Anchor 5 | What an exceptional level looks like, described in observable terms. |
| Evidence sources | Where a panelist may find evidence: CV, interview, case, reference, work sample. |
| Structured questions | Two or three questions every panelist asks in the same words. |

Anchors describe evidence, never people. "Has led two year end closes under IFRS with an unqualified opinion" is an anchor. "Confident" is not.

Templates exist for Financial Controller and Finance Manager. The hiring lead may edit weights and anchors before lock. Criteria that overlap with personality, health, or protected characteristics are prohibited (see GUARDRAILS.md).

### 2.3 Lock

The rubric is locked with a timestamp before the first finalist is entered. This is the product's integrity claim: the standard was written before anyone was measured against it.

After lock:

- Until the first score is submitted, the rubric may be amended. Every amendment records who, when, what changed, and why, and increments the rubric version.
- After the first score is submitted, the rubric is frozen for this role. If it must change, the role is re-versioned, all submitted scores are voided but retained in the audit log, and scoring restarts.

---

## 3. Score: blind, anchored, evidenced

### 3.1 The scale

Five points. 1, 3 and 5 are anchored in the rubric. 2 and 4 mean "between the two anchors". No half points. No "not applicable": if a panelist has no evidence for a criterion, they record 0 with the note "no evidence", and the cell is excluded from divergence and from the weighted result for that panelist.

### 3.2 The evidence rule

Every score carries an evidence note. The note must name the source and the fact. "Interview: described leading the FY24 consolidation of six entities, walked through the elimination of an intercompany margin without prompting" is a valid note. "Strong candidate" is not. The app rejects notes under 40 characters; on paper, the hiring lead does.

### 3.3 Blind reveal

Panelists cannot see each other's scores until one of two events:

- every panelist has submitted every score for every finalist, or
- the scoring deadline set at lock passes.

After reveal, no new scores may be submitted. A panelist who missed the deadline is recorded as absent for that Verdict. Scores are immutable once submitted.

### 3.4 Panelist independence

Panelists score alone. The kit and the app both instruct: no discussion of finalists between interview and submission. The hiring lead attests to this in the memo.

---

## 4. Compare: the divergence view

For each finalist and each criterion, the product computes the spread across panelists who scored it:

```
spread(finalist, criterion) = max(score) − min(score)   over panelists with score > 0
```

| Spread | Meaning | Action |
|---|---|---|
| 0 or 1 | Agreement | None |
| 2 | Divergence | Must be resolved in calibration |
| 3 or 4 | Contradiction | Must be resolved in calibration, and the memo names it |

Two further signals are computed:

**Reviewer agreement** for the Verdict as a whole is the share of scored cells with spread 0 or 1. High is 80 percent or above. Medium is 60 to 79. Low is below 60. It appears in the memo as a statement about the panel, never about a finalist.

**Rank disagreement** is flagged when two panelists' provisional weighted totals put finalists in a different order. It is shown as a fact for the calibration session and is never shown as a ranking.

The divergence view shows, for each finalist, the criterion by criterion spread, the evidence notes side by side, and nothing else. No totals appear before calibration.

---

## 5. Calibrate: resolve with reasons

The panel meets, on a call or in a document thread, and works through every flagged cell. For each:

1. Panelists read each other's evidence notes.
2. The panel agrees a calibrated score for that cell.
3. The hiring lead records the reason in one or more sentences, naming the evidence that settled it.

Rules:

- Unflagged cells take the panel mean, rounded to the nearest integer, with ties rounding down.
- A flagged cell left unresolved takes the panel mean and is marked unresolved. The memo lists every unresolved cell.
- Pre calibration scores are never edited or deleted. The calibrated score is a new record that references them.
- Calibration cannot add finalists, remove finalists, or change the rubric.

---

## 6. The weighted result

After calibration, and only then, each finalist has a weighted result:

```
result(finalist) = Σ over criteria of ( weight × calibrated_score ) ÷ 5
```

The result is a number from 0 to 100. It is displayed with the word "advisory" beside it, in entry order, never sorted, never coloured, never labelled hire or reject. A criterion scored 0 by every panelist is shown as "no evidence" and the result is footnoted as incomplete.

The result is an input to the recommendation. It is not the recommendation.

---

## 7. The Verdict memo

The memo is written by a human. The product generates every section except the recommendation from the record. The sections, in order:

1. **Decision context.** The role brief, the panel, the dates.
2. **The standard.** The locked rubric with its lock timestamp and any amendments.
3. **The finalists.** Initials or names per the notice given, and the evidence sources used.
4. **Scores before calibration.** The full matrix.
5. **Where the panel diverged.** Every flagged cell, the evidence on each side, and the reason recorded.
6. **Scores after calibration and the weighted result.** Labelled advisory.
7. **Risks.** Criteria where the best placed finalist scored 2 or below, unresolved cells, absent panelists, and any non negotiable not yet verified.
8. **Recommendation.** Human written. If it departs from the finalist with the highest weighted result, a written job related reason is mandatory. The memo cannot be issued without it.
9. **What happens next.** Reference checks outstanding, offer conditions, and the 90, 180 and 365 day outcome questions the hiring lead has agreed to answer.
10. **Use statement.** "This memo is structured hiring advisory. It is not a psychometric assessment and does not predict performance. The decision and its consequences rest with the employer."

The memo template is in templates/verdict-memo.md.

---

## 8. Outcomes

At 90, 180 and 365 days after start date the hiring lead answers four questions:

| Question | Answer type |
|---|---|
| Is the hire still in the seat? | Yes, no, plus reason if no |
| Manager satisfaction with the hire | 1 to 5 |
| Have early performance concerns arisen? | Yes, no, plus one line |
| Did the memo flag what later mattered? | Yes, partly, no, plus one line |

The register is per role, never per candidate, and it holds initials only. It exists so that Calibre can one day make a claim about itself. Until it holds at least twenty completed Verdicts with 365 day answers, no claim is made.

---

## 9. What the method never does

- Never scores before the rubric is locked.
- Never shows one panelist another's score before reveal.
- Never computes or shows a total before calibration.
- Never sorts, ranks, colours, or labels finalists.
- Never rejects a finalist automatically.
- Never uses a candidate facing instrument.
- Never uses an algorithm or model to produce, suggest, or adjust a score.
- Never keeps candidate personal data beyond the retention period.
