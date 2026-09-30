# Calibre brand

The brand canon for the Calibre surface: the product site, the attachment collateral, and the Verdict memo. Calibre only. Daftar Advisory is governed by its own handbook in the Daftar-Advisory repo and is not covered here.

| File | What it is |
|---|---|
| [HANDBOOK.html](HANDBOOK.html) | Unified Master Brand Playbook & Handbook, v2.0-Canon, published 23 September 2026. Supersedes Brand Handbook v1.0 (12 September 2026) and Brand Application Playbook editions 01–02. Colour, type, marks, the claim gate, deliverable structure, Arabic parity, surfaces, the release gate and the decisions register. |
| [site/calibre-guided-v2.dc.html](site/calibre-guided-v2.dc.html) | Guided v2: a five-room design for `/calibre` (Method, Deliverables, Who it's for, How it runs, FAQ, plus landing and contact). A Claude Design source file, not a deployable page. Not shipped. |

## Order of authority

1. [`product/METHOD.md`](../product/METHOD.md) and [`product/GUARDRAILS.md`](../product/GUARDRAILS.md) on what Calibre is and may claim.
2. [`HANDBOOK.html`](HANDBOOK.html) on colour, type, marks, application and release.
3. Copy on any surface.

Where copy and the method files disagree, the method files win and the copy is corrected.

## Corrections applied on merge, 27 September 2026

Factual errors and release-gate failures only. No decision in either file was changed.

| # | File | Was | Now | Why |
|---|---|---|---|---|
| 1 | HANDBOOK §02 | Daftar's ground given as `#FAF8F5` | `#F4F1EA` | `#FAF8F5` is the warm paper v1.0 rejected from Calibre's own palette. Daftar's cream is `#F4F1EA` per BRAND.md. |
| 2 | HANDBOOK §06 | Forest 600 on white 7.4:1; Ink 950 17.5:1 | 8.9:1; 18.9:1; Stone 600 9.7:1 added; Stone 500 5.6:1 noted as AA only | Recomputed from WCAG 2.x relative luminance, truncated. The handbook requires every number to be traceable. Stone 500 fails the handbook's own AAA rule for body copy, so it is restricted to secondary text. |
| 3 | HANDBOOK §05 | "written exclusively by seasoned advisory directors" | "written by a named human author" | Founder ruling, 12 September 2026: copy must not invent a team. |
| 4 | HANDBOOK §08, DEC-2026-03 | Pending: re-anchor links to `product/` | Partly resolved: links now resolve; CI check still to build | The handbook now sits beside `product/` in this repo. |
| 5 | Guided v2, contact strip | Use statement trimmed to its first sentence | All four sentences | Release gate item 5 and the claim gate: quote all four or none. |
| 6 | Guided v2, Room I | Steps named Define, Read, Compare, Calibrate; "two readers" | Read, Score, Compare, Calibrate; "your panelists" | METHOD.md names the four moves Read, Score, Compare, Calibrate, and the panel is the client's (2–5 panelists). The design had renamed them and blurred who scores. |

## Open, not fixed here

These need a decision or build work, so they are recorded rather than changed.

1. **Arabic parity.** Guided v2 is English only. Handbook §06 and release gate item 7 block release until `/ar/calibre` has a synchronized mirror.
2. **Not deployable as is.** The source depends on `./support.js` and the Claude Design runtime (`<x-dc>`, `sc-if`, `sc-for`). It needs a static export before it can replace `design/calibre-home.html` in Daftar-Advisory. Rooms render client-side from the URL hash, so only the landing room is in the initial HTML: a crawlability regression against the current static page. The source also carries no `<title>`, meta description or Open Graph tags.
3. **Body text contrast.** Guided v2 sets step descriptions (14px) and metadata in Stone 500 `#596B66`, 5.6:1. Handbook §06 requires AAA (7:1) for body copy. Move step descriptions to Stone 600 `#394740` (9.7:1).
4. **Untokenised tints.** Guided v2 uses `#A8C9B8`, `#C7DACF`, `#D7E6DE` and `#E3EEEA` on and near Forest 900. None is in the handbook's token table, which uses `#C9D8D2` for the same role. Consolidate, or add them to §03.
5. **Two deliverable vocabularies.** Guided v2 Room II lists Role standard, Evidence notes, Divergence record, Interview follow-ups, Recommendation memo. Handbook §05 lists Role Definition Matrix, Anchored Scorecard, Independent Review Grid, Calibration Notes, Executive Verdict Memo. Pick one.
6. **Superseded pricing documents, outside this repo.** DEC-2026-02 prohibits the solo-reviewer tier. The repo's single rate card is now [`kit/Calibre_Rate_Card.docx`](../kit/Calibre_Rate_Card.docx) (30 September 2026). CAL/01 and the two old rate cards in the latest-research archive still offer two tiers. Mark them superseded there.
7. **Stale Calibre rows in Daftar-Advisory, outside this repo.** `BRAND.md` still gives Calibre green as `#2C3A31` and says the two brands "share one type system and one voice; they diverge only in colour". `docs/RECONCILIATION.md` still routes Calibre colour and type to `BRAND.md`. Both are superseded for the Calibre surface by this handbook. Not changed here: this merge is Calibre only.
8. **CI string check.** If the check proposed in the SaaS architecture brief is built (fail on `daftar`, `#A8341F`, `Fraunces` and similar), this handbook will trip it by design, because it names Daftar's tokens in order to ban them. Allowlist `brand/HANDBOOK.html`.
