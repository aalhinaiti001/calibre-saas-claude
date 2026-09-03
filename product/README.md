# Calibre product fundamentals

This directory is the product's foundation. Everything here is true whether Calibre is delivered by hand, as a licensed kit, or as software. Nothing here is application code.

| File | What it fixes |
|---|---|
| [METHOD.md](METHOD.md) | The scoring method: scale, weights, evidence rule, blind reveal, divergence metric, calibration, the weighted result, and what the Verdict memo contains. |
| [DOMAIN-MODEL.md](DOMAIN-MODEL.md) | The entities, their states, and the invariants the product must never break. |
| [GUARDRAILS.md](GUARDRAILS.md) | Allowed and prohibited uses, the candidate notice, data handling, retention, accommodations. |
| [templates/financial-controller.rubric.json](templates/financial-controller.rubric.json) | The Financial Controller role pack: criteria, weights, anchors, evidence sources, structured questions. |
| [templates/finance-manager.rubric.json](templates/finance-manager.rubric.json) | The Finance Manager role pack. |
| [templates/verdict-memo.md](templates/verdict-memo.md) | The memo template, section by section. |
| [schema/schema.sql](schema/schema.sql) | The Postgres data model with row level security, immutability rules, audit log, and retention. |
| [DECISIONS.md](DECISIONS.md) | Architecture decision records and the founder decision log. |

Read METHOD.md first. The rest implements it.
