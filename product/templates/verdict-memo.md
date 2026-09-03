# Calibre Verdict

**Role:** {{role.title}} · {{organisation.name}}
**Prepared by:** {{author}} · **Issued:** {{issued_at}} · **Memo version:** {{verdict.version}}
**Panel:** {{panel.names}} · **Hiring lead:** {{lead.name}}

> This memo is structured hiring advisory. It is not a psychometric assessment and does not predict performance. The decision and its consequences rest with the employer.

---

## 1. Decision context

{{brief.seat}}

**First year outcomes.** {{brief.outcomes}}

**What makes this hire hard.** {{brief.context}}

**Non negotiables.** {{brief.non_negotiables}} · Verified for all finalists: {{non_negotiables.verified}}

**Dates.** Rubric locked {{rubric.locked_at}} · Scoring closed {{scoring.closed_at}} · Calibration {{calibration.date}}

---

## 2. The standard

Rubric version {{rubric.version}}, locked {{rubric.locked_at}} before any finalist was entered.

| Criterion | Weight | Anchor 3, the hireable level |
|---|---|---|
{{#criteria}}| {{name}} | {{weight}} | {{anchor_3}} |
{{/criteria}}

{{#amendments}}**Amendment {{n}}** ({{at}}, {{by}}): {{what}}. Reason: {{why}}.
{{/amendments}}

---

## 3. The finalists

| Ref | Initials | Evidence sources used | Candidate notice sent |
|---|---|---|---|
{{#finalists}}| {{ref}} | {{initials}} | {{sources}} | {{notice_sent}} |
{{/finalists}}

Panelists scored independently and did not discuss finalists between interview and submission. Attested by {{lead.name}}.

---

## 4. Scores before calibration

{{#finalists}}
### {{ref}} · {{initials}}

| Criterion | {{#panel}}{{initials}} | {{/panel}}Spread |
|---|{{#panel}}---|{{/panel}}---|
{{#criteria}}| {{name}} | {{#scores}}{{value}} | {{/scores}}{{spread}} |
{{/criteria}}
{{/finalists}}

Reviewer agreement across the panel: **{{agreement.label}}** ({{agreement.pct}} percent of scored cells within one point).

---

## 5. Where the panel diverged

{{#divergences}}
**{{finalist.ref}} · {{criterion.name}}** · spread {{spread}} ({{class}})

{{#sides}}- {{panelist}} scored {{value}}: {{evidence}}
{{/sides}}
Resolved at {{calibrated.value}}. Reason: {{calibrated.reason}}
{{/divergences}}

{{#unresolved}}Unresolved: {{finalist.ref}} · {{criterion.name}}, carried at the panel mean of {{mean}}.
{{/unresolved}}

---

## 6. Scores after calibration and the weighted result

| Criterion (weight) | {{#finalists}}{{ref}} | {{/finalists}}
|---|{{#finalists}}---|{{/finalists}}
{{#criteria}}| {{name}} ({{weight}}) | {{#calibrated}}{{value}} | {{/calibrated}}
{{/criteria}}
| **Weighted result, advisory** | {{#finalists}}**{{result}}** | {{/finalists}}

Finalists are listed in the order they were entered. The weighted result is an input to the recommendation, not the recommendation.

---

## 7. Risks

{{#risks}}- **{{finalist.ref}}, {{criterion.name}}:** calibrated at {{value}}. {{note}}
{{/risks}}
{{#absent}}- Panelist {{initials}} did not submit before the deadline and is excluded from this Verdict.
{{/absent}}

---

## 8. Recommendation

{{recommendation.text}}

{{#departure}}**Why this departs from the highest weighted result.** {{departure.reason}}
{{/departure}}

---

## 9. What happens next

- References outstanding: {{next.references}}
- Offer conditions: {{next.conditions}}
- Outcome questions: {{lead.name}} has agreed to answer the four outcome questions at 90, 180 and 365 days from start date.
- Retention: finalist personal data is deleted {{retention.days}} days after this memo's issue date. Scores, reasons and this memo are kept with initials only.

---

*Calibre by Daftar · calibre.daftaradvisory.com · Structured hiring advisory for finance roles.*
