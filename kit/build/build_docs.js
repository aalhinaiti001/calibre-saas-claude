// Builds the three Calibre kit Word documents in the Calibre brand (brand/HANDBOOK.html).
// Usage: node kit/build/build_docs.js [outDir]   (outDir defaults to kit/)
// Requires the `docx` npm package (see kit/build/package.json).
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Footer, PageNumber,
  AlignmentType, BorderStyle, ShadingType, WidthType, HeadingLevel, LevelFormat, LineRuleType,
} = require("docx");

const OUT = process.argv[2] || path.join(__dirname, "..");
const RUBRIC = require("./default-finance-rubric.json").criteria;

// Calibre tokens, brand/HANDBOOK.html §03. No Daftar cream, rust or monospace anywhere.
const C = {
  white: "FFFFFF", paper100: "F6F7F8", forest50: "F0F5F3", forest100: "D5E3DE",
  forest600: "265147", forest700: "1C3D35", forest900: "0E211B",
  ink: "0E1113", stone600: "394740", stone500: "596B66",
};
const SERIF = "Lora";
const SANS = "Plus Jakarta Sans";
const USE_STATEMENT =
  "Structured hiring advisory for finance roles. Not a psychometric assessment. Does not predict performance. " +
  "The decision, and its consequences, rest with the employer.";

// A4, 24 mm margins (handbook §07, Verdict memo spec).
const PAGE_W = 11906, PAGE_H = 16838, MARGIN = 1361, CONTENT = PAGE_W - 2 * MARGIN; // 9184

// ---------------------------------------------------------------- primitives
const run = (text, o = {}) => new TextRun({ text, font: o.font || SANS, size: o.size || 19, color: o.color || C.stone600,
  bold: o.bold, italics: o.italics, allCaps: o.caps, characterSpacing: o.spacing });

const para = (children, o = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [typeof children === "string" ? run(children, o) : children],
  spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line ?? 300, lineRule: LineRuleType.AUTO },
  alignment: o.align, border: o.border, shading: o.shading, indent: o.indent, keepNext: o.keepNext,
  heading: o.heading, numbering: o.numbering,
});

const body = (text, o = {}) => para(text, { ...o });
const note = (text) => para(run(text, { italics: true, color: C.stone500, size: 17 }), { after: 120 });
const guide = (text) => para([run("Guidance  ", { bold: true, color: C.forest600, size: 16, caps: true, spacing: 20 }),
  run(text, { italics: true, color: C.stone500, size: 17 })], { after: 140 });
const bullets = (items) => items.map((t) => para(t, { numbering: { reference: "bullets", level: 0 }, after: 30 }));

const wordmark = () => para([
  run("Calibre", { font: SERIF, italics: true, size: 34, color: C.forest900 }),
  run("   by Daftar", { font: SANS, size: 17, color: C.stone500, bold: true }),
], { after: 280 });

const eyebrow = (text) => para(run(text, { size: 15, bold: true, color: C.forest600, caps: true, spacing: 30 }), {
  after: 220, border: { left: { style: BorderStyle.SINGLE, size: 18, color: C.forest600, space: 8 } }, indent: { left: 170 } });

const title = (text) => para(run(text, { font: SERIF, size: 46, color: C.forest900 }), { after: 180, line: 276 });
const lede = (text) => para(run(text, { font: SERIF, size: 23, color: C.stone600 }), { after: 240, line: 330 });

const section = (num, text) => [
  para(run(`§ ${num}`, { size: 15, bold: true, color: C.forest600, spacing: 30 }), { before: 200, after: 30, keepNext: true }),
  new Paragraph({ heading: HeadingLevel.HEADING_1, keepNext: true, spacing: { before: 0, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.forest100, space: 6 } },
    children: [run(text, { font: SERIF, size: 30, color: C.forest900 })] }),
];
const sub = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, spacing: { before: 200, after: 80 },
  children: [run(text, { bold: true, size: 20, color: C.forest700 })] });

// Left-ruled callout, handbook §04 (border, never a shadow).
const callout = (tag, lines, o = {}) => {
  const border = { left: { style: BorderStyle.SINGLE, size: 24, color: o.rule || C.forest600, space: 10 } };
  const shading = { type: ShadingType.CLEAR, color: "auto", fill: o.fill || C.forest50 };
  const out = [];
  if (tag) out.push(para(run(tag, { size: 15, bold: true, color: o.rule || C.forest600, caps: true, spacing: 30 }),
    { border, shading, indent: { left: 200, right: 120 }, before: 160, after: 0, line: 280, keepNext: true }));
  lines.forEach((l, i) => out.push(para(typeof l === "string" ? run(l, { color: C.forest900 }) : l,
    { border, shading, indent: { left: 200, right: 120 }, before: tag || i ? 0 : 160, after: i === lines.length - 1 ? 200 : 60, line: 290 })));
  return out;
};
const useStatement = () => callout("Use statement", [USE_STATEMENT], { fill: C.forest100 });

// ---------------------------------------------------------------- tables
const NONE = { style: BorderStyle.NONE, size: 0, color: "auto" };
const cell = (content, width, o = {}) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
  margins: { top: 60, bottom: 60, left: 110, right: 110 },
  borders: { top: NONE, left: NONE, right: NONE,
    bottom: o.head ? { style: BorderStyle.SINGLE, size: 12, color: C.forest600 } : { style: BorderStyle.SINGLE, size: 4, color: C.forest100 } },
  children: (Array.isArray(content) ? content : [content]).map((c) =>
    c instanceof Paragraph ? c : para(run(String(c ?? ""), o.run || {}), { after: 0, line: 264 })),
});

const table = (headers, rows, widths, o = {}) => {
  const total = widths.reduce((a, b) => a + b, 0);
  const head = headers ? [new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((h, i) =>
    cell(h, widths[i], { head: true, fill: C.forest50, run: { bold: true, size: 15, color: C.forest900, caps: true, spacing: 10 } })) })] : [];
  const rs = rows.map((r) => new TableRow({ cantSplit: true, children: r.map((v, i) => cell(v, widths[i], {
    run: i === 0 && o.keyCol ? { bold: true, color: C.forest700 } : o.inputCols?.includes(i) ? { color: C.stone500 } : {} })) }));
  return [new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths,
    borders: { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE },
    rows: [...head, ...rs] }), para("", { after: 0, line: 160 })];
};
// Two-column label / value or label / blank entry table.
const kv = (pairs, keyW = 2700) => table(null, pairs, [keyW, CONTENT - keyW], { keyCol: true });

// ---------------------------------------------------------------- document shell
const footer = (docName) => new Footer({ children: [para([
  run("Calibre by Daftar", { bold: true, size: 15, color: C.forest700 }),
  run(`  ·  A product of Daftar Advisory · Amman  ·  ${docName}  ·  `, { size: 15, color: C.stone500 }),
  new TextRun({ children: [PageNumber.CURRENT], font: SANS, size: 15, color: C.stone500 }),
], { border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.forest100, space: 6 } }, after: 0 })] });

const build = (file, docName, children) => {
  const doc = new Document({
    creator: "Calibre by Daftar", title: docName,
    styles: {
      default: { document: { run: { font: SANS, size: 19, color: C.stone600 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: SERIF, size: 30, color: C.forest900 }, paragraph: { outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: SANS, size: 20, bold: true, color: C.forest700 }, paragraph: { outlineLevel: 1 } },
      ],
    },
    numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
      alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } }, run: { color: C.forest600 } } }] }] },
    sections: [{ properties: { page: { size: { width: PAGE_W, height: PAGE_H },
      margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN, footer: 600 } } },
      footers: { default: footer(docName) }, children }],
  });
  return Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(path.join(OUT, file), buf); console.log("wrote", file); });
};

// ================================================================ 1. Rate card
const rateCard = () => build("Calibre_Rate_Card.docx", "Private rate card", [
  wordmark(), eyebrow("Private rate card"),
  title("The Calibre Verdict"),
  lede("For a finance hire where the shortlist is defined and the panel needs one written, inspectable basis for its decision."),
  ...kv([
    ["Fee", "USD 5,500 fixed"],
    ["Role", "One finance role"],
    ["Finalists", "Up to four included. A fifth or sixth is quoted before start."],
    ["Panel", "Two to five of your decision-makers"],
    ["Criteria", "Four to nine, weighted to 100, anchored at 1, 3 and 5"],
    ["Delivery", "Ten to twelve business days from criteria lock"],
    ["Calibration", "One facilitated 75-minute session"],
    ["Output", "One written Calibre Verdict and the editable working file"],
  ]),
  ...section("01", "What is included"),
  ...bullets([
    "One 60-minute role-intake call.",
    "A written role brief: the seat, the first-year outcomes, what makes the hire hard, and verifiable non-negotiables.",
    "A locked rubric of four to nine criteria, weighted to 100, with anchors at 1, 3 and 5.",
    "Structured interview questions aligned to the rubric.",
    "Independent panel scoring, with a written evidence note behind every score.",
    "A divergence review and one facilitated calibration session.",
    "A written Verdict recording the evidence, the scores before and after calibration, the remaining risks and a human-written advisory recommendation, with a live readout.",
    "Outcome follow-up at 90, 180 and 365 days.",
  ]),
  ...section("02", "How the engagement runs"),
  ...table(["Step", "What happens"], [
    ["1  Intake", "A 60-minute call fixes the role, the context and the draft criteria. This sits before the clock."],
    ["2  Lock", "You sign off the criteria and weightings. The clock starts here. They do not change once scoring begins."],
    ["3  Score", "Each panelist scores every finalist independently against the anchors, with an evidence note behind every score. No one sees another panelist's scores until all are in."],
    ["4  Compare", "Calibre reveals the spread, criterion by criterion. Any gap of two points or more is flagged for calibration."],
    ["5  Calibrate", "One facilitated 75-minute session. Every flagged score is discussed and resolved with a written reason. The original scores stay in the record."],
    ["6  Verdict", "The written Verdict follows within three business days of the session, with a live readout to challenge the reasoning."],
    ["7  Outcomes", "Calibre records what you decided and follows up at 90, 180 and 365 days."],
  ], [1900, CONTENT - 1900], { keyCol: true }),
  ...section("03", "What is not included"),
  ...bullets([
    "Candidate sourcing, interview scheduling, reference checks or offer negotiation.",
    "Psychometric, personality, work-style, culture or fit assessment.",
    "Automated candidate ranking, or a recommendation generated by a model.",
    "A candidate portal or any candidate-facing test.",
    "The hiring decision itself.",
  ]),
  ...section("04", "Terms"),
  ...kv([
    ["Fee basis", "Fixed fee. Not hourly, and not contingent on a hire being made."],
    ["Payment", "50% on criteria lock. 50% on delivery of the written Verdict."],
    ["Currency", "Invoiced in USD. SAR or AED equivalents on request."],
    ["Valid for", "60 days from issue."],
    ["Scope change", "Additional finalists, a second role, or a rubric change after lock require a written variation and a new lock, quoted before any work begins."],
    ["Data handling", "Candidate notice, access, retention and deletion follow the engagement letter and the Calibre data record. Candidate personal data is deleted 90 days after the Verdict is issued unless the engagement letter sets another lawful schedule."],
    ["Decision", "Calibre provides advisory structure. The employer makes the hiring decision and owns its consequences."],
    ["Status", "A private rate card for a direct conversation. Not a published price list, and not an offer capable of acceptance until confirmed in an engagement letter."],
  ]),
  ...useStatement(),
]);

// ================================================================ 2. Intake and criteria lock
const blank = "";
const intake = () => build("Calibre_Role_Intake_and_Criteria_Lock.docx", "Role intake and criteria lock", [
  wordmark(), eyebrow("Working template · Role intake and criteria lock"),
  title("Role intake and criteria lock"),
  lede("Completed on the intake call. Section 06 is the lock: once it is signed, the criteria do not change for the life of the engagement."),
  ...callout("Why this form is binding", ["A Calibre Verdict is defensible because the criteria were agreed before anyone looked at a candidate. If criteria are added, dropped or re-weighted after scoring begins, the Verdict is no longer evidence of a structured process and is not issued."]),

  ...section("01", "Engagement details"),
  ...kv([
    ["Client entity", "legal name"], ["Hiring lead", "name, title, email"], ["Decision-maker", "if different from the hiring lead"],
    ["Engagement reference", blank], ["Intake call date", blank], ["Criteria locked on", "see section 06"],
    ["Scoring deadline", "date by which every panelist submits"], ["Target Verdict date", "ten to twelve business days from criteria lock"],
  ].map(([k, v]) => [k, run(v, { color: C.stone500, italics: true })]).map(([k, r]) => [k, para(r, { after: 0 })])),

  ...section("02", "The role brief"),
  body("Four fields, each mandatory. Every Verdict opens with them."),
  sub("Seat"),
  ...kv([["Role title", blank], ["Reports to", "title and seniority"], ["Direct reports", "number and seniority"],
    ["Entity scope and location", blank], ["Why the role is open", "growth, replacement, restructure"]]),
  sub("First-year outcomes"),
  body("Three to five things that must be true twelve months in."),
  ...table(["#", "Outcome"], [["1", blank], ["2", blank], ["3", blank], ["4", blank], ["5", blank]], [700, CONTENT - 700], { keyCol: true }),
  ...callout("Stop rule", ["If the client cannot state what the first twelve months must deliver, the criteria cannot be locked. Stop and reschedule rather than proceed on a guess."], { rule: C.stone500, fill: C.paper100 }),
  sub("What makes this hire hard"),
  note("For example: a first year under IFRS, open audit findings, IPO preparation, an ERP change, a departing incumbent."),
  ...table(["Factor", "Client answer"], [
    ["Entity stage and size", blank], ["Sector", blank], ["Jurisdiction(s) and tax regime", blank], ["Reporting framework", blank],
    ["ERP and reporting stack", blank], ["Audit status and auditor", blank], ["Group or consolidation complexity", blank],
    ["Known constraints", "budget, timing, right to work"],
  ], [3400, CONTENT - 3400], { keyCol: true, inputCols: [1] }),
  sub("Non-negotiables"),
  body("Job-related and verifiable only: a qualification, a language, the right to work."),
  ...table(["#", "Non-negotiable", "How it is verified"], [["1", blank, blank], ["2", blank, blank], ["3", blank, blank]], [700, 4600, CONTENT - 5300], { keyCol: true }),
  ...callout("Never a non-negotiable", ["Personality, age, family status, health, nationality beyond the right to work, religion, or any other protected characteristic."], { rule: C.stone500, fill: C.paper100 }),

  ...section("03", "The panel"),
  body("Two to five panelists. One is the hiring lead. Each panelist scores every finalist independently and does not discuss finalists with other panelists between interview and submission. The hiring lead attests to this in the Verdict."),
  ...table(["Ref", "Name", "Title", "Email", "Hiring lead"],
    ["P1", "P2", "P3", "P4", "P5"].map((p) => [p, blank, blank, blank, "Yes / No"]), [800, 2600, 2300, 2384, 1100], { keyCol: true, inputCols: [4] }),

  ...section("04", "Criteria and weightings"),
  body("The default finance rubric carries nine criteria. Amend the wording, the must or preferred designation and the weightings on this call. Keep between four and nine criteria. Weightings are whole numbers and must total 100."),
  ...table(["Ref", "Criterion", "Must / Preferred", "Weight %"],
    [...RUBRIC.map((c) => [c.ref, c.name, c.must, String(c.weight)]), ["", "Total", "", "100"]],
    [800, 5184, 1900, 1300], { keyCol: true }),
  note("Anchor definitions for each criterion are on sheet 01 of the working file. Read them aloud on the call: a criterion the client cannot describe at anchor 5 is one they do not actually need. No criterion may touch personality, health or a protected characteristic."),

  ...section("05", "Evidence the client will supply"),
  body("Calibre reviews only the evidence supplied. Anything not listed here is recorded in the Verdict as a gap."),
  ...table(["Evidence", "Supplied (Y/N)", "Date received"], [
    ["CVs for all finalists", blank, blank], ["Interview notes, per panelist", blank, blank], ["Interview scores or ratings, if any", blank, blank],
    ["Technical test or work product", blank, blank], ["Job description as advertised", blank, blank], ["Other material", blank, blank],
  ], [5184, 1900, 2100], { keyCol: true }),

  ...section("06", "The lock"),
  body("By signing below, the client confirms that the role brief in section 02 and the criteria and weightings in section 04 are complete and final, and that the panel may begin scoring."),
  ...kv([["Criteria locked on", "date and time"], ["Client signature", blank], ["Name and title", blank], ["Calibre lead", blank]]
    .map(([k, v]) => [k, para(run(v, { color: C.stone500, italics: true }), { after: 0 })])),
  ...callout("If the criteria change after the lock", [
    "Before the first score is submitted, an amendment is allowed: record who, when, what changed and why, and sign again.",
    "After the first score, the criteria are frozen. A change means a new rubric version: submitted scores are voided but kept in the record, scoring restarts, and the re-run is quoted separately. Never re-weight silently.",
  ]),

  ...section("07", "Shortlist register"),
  ...table(["Ref", "Candidate name", "Source", "Notice sent (date)", "Evidence complete"],
    ["K1", "K2", "K3", "K4", "K5", "K6"].map((k) => [k, blank, blank, blank, "Y / N"]), [800, 3200, 1900, 1900, 1384], { keyCol: true, inputCols: [4] }),
  note("Four finalists are included in the fee. A fifth or sixth is quoted before start. References K1 to K6 are used throughout the working file and the Verdict, and candidates always appear in this order, never sorted by score."),

  ...section("08", "Candidate notice and use policy"),
  ...bullets([
    "The client sends each finalist the Calibre candidate notice before their information is used, and records the date in section 07. The notice template and data record are in the Calibre Candidate Notice and Data Record.",
    "Candidate personal data is deleted 90 days after the Verdict is issued unless the engagement letter sets another lawful schedule. Initials and scores are kept for the outcome register.",
    "Reasonable adjustments are recorded separately. The reason never appears in the rubric, the scores or the Verdict.",
  ]),
  body("The client has read and accepts the Calibre allowed and prohibited use policy. Calibre is never used to screen applicants before a shortlist exists, to reject a candidate automatically or on a score alone, to produce an overall fit score, pass mark or hire label, to assess any protected characteristic, or to decide about existing employees.", { before: 120 }),
  ...kv([["Accepted by", blank], ["Date", blank]]),

  ...section("09", "Out of scope, acknowledged"),
  ...bullets(["Candidate sourcing", "Interview scheduling", "Reference checks", "Psychometric or personality testing",
    "Work-style, culture or fit assessment", "Automated candidate ranking", "Offer negotiation", "The hiring decision itself"]),
  ...callout(null, ["Calibre provides the record. The employer retains the decision."]),
  ...useStatement(),
]);

// ================================================================ 3. Verdict memo template
const ph = (t) => run(t, { color: C.forest700 });
const memo = () => build("Calibre_Verdict_Memo_Template.docx", "Verdict memo template", [
  wordmark(), eyebrow("Verdict memo · Template"),
  title("Calibre Verdict: [Role] · [Client]"),
  ...callout("Template", ["Replace every bracketed placeholder and delete the guidance notes before issuing. The sections follow product/METHOD.md §7, in order. Candidates always appear in reference order, K1 first, never sorted by score."], { rule: C.stone500, fill: C.paper100 }),
  ...kv([["Client", "[Client entity]"], ["Role", "[Role title]"], ["Hiring lead", "[Name, title]"], ["Panel", "[P1 to P5 names]"],
    ["Finalists reviewed", "[K1 to K_]"], ["Rubric locked", "[Version n, date and time]"], ["Scoring closed", "[Date]"],
    ["Calibration session", "[Date]"], ["Verdict issued", "[Date]"], ["Memo version", "[n]"], ["Prepared by", "[Calibre lead]"]]),
  ...useStatement(),

  sub("Purpose and limits of this Verdict"),
  body("This Verdict is an advisory structuring of the evidence supplied by the client. It is not a hiring decision, an assessment of the candidate as a person, or a prediction of future performance. Every conclusion is stated against a role criterion that was agreed and locked before any candidate evidence was reviewed. No psychometric instrument, personality inventory, work-style profile or culture-fit measure has been used, and none of the conclusions rest on inference about protected characteristics. Where the evidence does not support a conclusion, that is recorded as a gap rather than resolved by assumption. The employer retains the hiring decision in full."),
  guide("Standing text. It keeps the Verdict advisory rather than determinative, and it is the first thing a challenged client will point to. Reword it only with a considered reason."),

  ...section("01", "Decision context"),
  ...kv([["Seat", "[Title, reporting line, team size, entity scope, location]"], ["First-year outcomes", "[Three to five, from the intake form]"],
    ["What makes this hire hard", "[From the intake form]"], ["Non-negotiables", "[List] · Verified for all finalists: [Yes / No, with any exceptions]"],
    ["Panel", "[Names. Hiring lead: name]"], ["Dates", "[Rubric locked · scoring closed · calibration session]"]]),

  ...section("02", "The standard"),
  body("Rubric version [n], locked [date and time] before any finalist was scored. It was not changed at any point after the first score was submitted."),
  ...table(["Ref", "Criterion", "Must / Pref.", "Weight", "Anchor 3, the hireable level"],
    RUBRIC.map((c) => [c.ref, c.name, c.must, String(c.weight), c.anchor_3]), [700, 2300, 1150, 900, CONTENT - 5050], { keyCol: true }),
  guide("Paste the engagement's locked rubric, not this default. If a criterion was amended before the first score, show the amended wording and add: Amendment [n] ([date], [who]): [what]. Reason: [why]."),

  ...section("03", "The finalists"),
  ...table(["Ref", "Initials", "Evidence sources used", "Candidate notice sent"],
    ["K1", "K2", "K3", "K4"].map((k) => [k, "[  ]", "[CV, interview notes, work sample]", "[Date]"]), [800, 1300, 4884, 2200], { keyCol: true }),
  para([run("Evidence not supplied.  ", { bold: true, color: C.forest700 }), ph("[What was requested and not received. This list is the origin of most of the risks in section 07, and it protects the Verdict where a conclusion later proves wrong for a reason the evidence could not have shown.]")]),
  para([run("Independence.  ", { bold: true, color: C.forest700 }), run("Panelists scored independently and did not discuss finalists between interview and submission. Attested by "), ph("[hiring lead]"), run(".")]),

  ...section("04", "Scores before calibration"),
  body("The full matrix from sheet 02 of the working file. A score of 0 means no evidence was supplied; it is excluded from the spread and never read as a low score."),
  ...table(["K1 · Criterion", "P1", "P2", "P3", "P4", "P5", "Spread"],
    RUBRIC.map((c) => [`${c.ref}  ${c.name}`, "", "", "", "", "", ""]), [3784, 900, 900, 900, 900, 900, 900], { keyCol: true }),
  guide("Repeat this table for each finalist, in reference order."),

  ...section("05", "Where the panel diverged"),
  body("Every cell with a spread of two points or more, the evidence on each side, and how the panel resolved it. A spread of 2 is a divergence. A spread of 3 or 4 is a contradiction, and each one is named in the prose below."),
  ...table(["Finalist", "Criterion", "Scores", "Spread", "Evidence on each side", "Agreed", "Reason recorded"],
    [["[K_]", "[C_]", "[e.g. 2, 4, 4]", "[2]", "[Evidence notes, side by side]", "[3]", "[The evidence that settled it]"]],
    [1000, 1250, 1050, 940, 2044, 1000, 1900], { keyCol: true }),
  para([run("Contradictions.  ", { bold: true, color: C.forest700 }), ph("[Name each spread of 3 or 4: whether the disagreement was about the evidence, the meaning of the criterion, or its weighting, and how it was resolved.]")]),
  para([run("Unresolved.  ", { bold: true, color: C.forest700 }), ph("[Any flagged cell the panel could not resolve. It takes the panel mean and is carried into section 07 as a risk.]")]),

  ...section("06", "Scores after calibration and the weighted result"),
  ...table(["Ref", "Criterion", "Weight", "K1", "K2", "K3", "K4"],
    [...RUBRIC.map((c) => [c.ref, c.name, String(c.weight), "", "", "", ""]), ["", "Weighted result (advisory)", "", "", "", "", ""]],
    [700, 3884, 900, 925, 925, 925, 925], { keyCol: true }),
  guide("Shown in entry order. Never sorted, coloured or labelled. The weighted result runs from 0 to 100 and is an input to the recommendation, not the recommendation. A criterion with no evidence is shown as \"no evidence\" and the result is footnoted as incomplete."),
  sub("Findings by finalist"),
  ...["K1", "K2", "K3"].flatMap((k) => [
    para(run(`${k}  ·  [initials]`, { font: SERIF, size: 23, color: C.forest900 }), { before: 160, after: 80, keepNext: true }),
    para([run("Strengths against the role requirements.  ", { bold: true, color: C.forest700 }), ph("[Two or three findings, each naming the criterion and the evidence. e.g. Meets C2 at anchor 5: owned the close for a 40-entity group, evidenced in the CV and confirmed in the second interview note of 12 May.]")]),
    para([run("Material gaps and uncertainties.  ", { bold: true, color: C.forest700 }), ph("[What the evidence does not support, and what would resolve it. A demonstrated weakness and an absence of evidence are different findings and carry different weight.]")]),
    para([run("Evidence basis.  ", { bold: true, color: C.forest700 }), ph("[Where conclusions rest on documented evidence, on interview assertion alone, or on inference. Anything resting on inference is named.]")]),
  ]),

  ...section("07", "Risks"),
  ...bullets([
    "[Criteria on which the finalist with the highest weighted result scored 2 or below.]",
    "[Flagged cells left unresolved after calibration.]",
    "[Absent panelists, and whose scores are therefore missing.]",
    "[Non-negotiables not yet verified.]",
  ]),
  para([run("Where the evidence is thin.  ", { bold: true, color: C.forest700 }), ph("[Each open uncertainty, tied to a criterion, with the specific step that would resolve it: a targeted question, a work sample, a reference call the client commissions separately.]")]),
  para([run("What this Verdict cannot tell you.  ", { bold: true, color: C.forest700 }), ph("[Be explicit. This is the product behaving honestly, and clients read it as the most credible part of the memo.]")]),

  ...section("08", "Recommendation"),
  para(ph("[The recommendation in one sentence, tied to the locked criteria. Then the reasoning in prose: which criteria drove it, which evidence carried the most weight, and what would change it.]")),
  para([run("If you proceed with [K_].  ", { bold: true, color: C.forest700 }), ph("[The specific risks, and the mitigation the client can put in place: an onboarding focus, a probation checkpoint, a supporting hire.]")]),
  ...callout("Departure from the weighted result", [
    "If this recommendation is not the finalist with the highest weighted result, state the job-related reason here. The Verdict cannot be issued without it.",
    ph("[Reason]"),
  ]),
  body("This is advice on the evidence against the agreed criteria. The hiring decision, and responsibility for it, remain with the employer."),

  ...section("09", "What happens next"),
  ...kv([["Reference checks outstanding", "[List]"], ["Offer conditions", "[List]"]]),
  body("The hiring lead has agreed to answer four questions at each checkpoint after the start date. The answers are recorded against the role, by initials only."),
  ...table(["Checkpoint", "Due", "Still in the seat?", "Manager satisfaction (1 to 5)", "Early concerns?", "Did the Verdict flag what later mattered?"],
    [["90 days", "[Date]", "", "", "", ""], ["180 days", "[Date]", "", "", "", ""], ["365 days", "[Date]", "", "", "", ""]],
    [1300, 1300, 1500, 1700, 1500, 1884], { keyCol: true }),

  ...section("10", "Use statement"),
  body(USE_STATEMENT),
]);

// ================================================================ 4. Service definition
const serviceDefinition = () => build("Calibre_Service_Definition.docx", "Service definition", [
  wordmark(), eyebrow("Service definition"),
  title("One role, one panel, one written Verdict"),
  lede("The Calibre Verdict is a bounded, evidence-led service for a defined finance-role shortlist. It creates a common standard, preserves independent judgment, makes disagreement visible, and ends with a human-written advisory memo."),
  ...section("01", "Service boundary"),
  ...kv([["Role", "One finance role"], ["Finalists", "Two to six. Four are included in the fee; a fifth or sixth is quoted before start."],
    ["Panel", "Two to five decision-makers, one of them the hiring lead"], ["Criteria", "Four to nine, weighted to 100"],
    ["Fee", "USD 5,500 fixed. 50% on criteria lock, 50% on delivery of the written Verdict."],
    ["Output", "One written Calibre Verdict"], ["Decision owner", "The employer"]]),
  sub("Included"),
  ...bullets([
    "A role brief covering the seat, three to five first-year outcomes, what makes the hire hard, and verifiable job-related non-negotiables.",
    "A locked rubric with criterion weights, anchors at 1, 3 and 5, permitted evidence sources and structured questions.",
    "Independent panel scoring before reveal, with a written evidence note behind every score.",
    "A divergence review and mandatory calibration of every flagged finalist-criterion cell.",
    "A final memo containing the pre-calibration record, calibrated results, risks, uncertainties, the recommendation and the outcome plan.",
    "Outcome checks at 90, 180 and 365 days.",
  ]),
  sub("Excluded"),
  ...bullets([
    "Candidate sourcing, scheduling, reference checks, offer negotiation and applicant tracking.",
    "Psychometric, personality, work-style, culture or fit assessment.",
    "Automated scoring, ranking, labels, hidden sorting, or a model-generated recommendation.",
    "The hiring decision itself.",
  ]),
  ...section("02", "Method"),
  ...table(["Step", "Panel action", "Control"], [
    ["Read", "Agree the role brief and rubric.", "Lock before any finalist is scored."],
    ["Score", "Each panelist scores every finalist independently.", "Scores are blind and immutable after submission."],
    ["Compare", "Review the score spread, the evidence and the disagreement.", "No totals are shown before calibration."],
    ["Calibrate", "Discuss every flagged cell and record the resolution.", "Pre-calibration scores remain in the record."],
    ["Verdict", "Review the written advice and the named risks.", "Weighted results are advisory and shown in entry order."],
  ], [1500, 3900, 3784], { keyCol: true }),
  ...section("03", "Data and candidate safeguards"),
  ...bullets([
    "Record that each candidate received the notice before their information is used.",
    "Record reasonable adjustments without recording their reason in the rubric, scores or memo.",
    "Collect only job-related evidence, and use candidate references in working views.",
    "Purge personal data 90 days after the memo is issued, unless the engagement letter sets another lawful schedule.",
    "After purge, keep only initials or non-identifying references with the outcome data.",
    "Make no performance-prediction, legal-compliance, bias-elimination or scientific-validity claim.",
  ]),
  ...section("04", "Delivery sequence"),
  ...table(["Milestone", "Required output", "Gate"], [
    ["Intake", "Role brief and draft rubric", "Outcomes and evidence sources are clear."],
    ["Lock", "Signed rubric version", "Weights total 100; four to nine criteria; anchors complete."],
    ["Panel scoring", "Independent score records", "Every score has an evidence note; 0 means no evidence."],
    ["Reveal", "Divergence view", "All panelists submitted, or the scoring deadline has passed."],
    ["Calibration", "Resolution log", "Every flagged cell discussed."],
    ["Issue and follow-up", "Verdict memo and outcome register", "Use statement present; 90, 180 and 365-day checks scheduled."],
  ], [1900, 3000, 4284], { keyCol: true }),
  ...section("05", "Commercial discipline"),
  ...kv([
    ["Offer", "Sell one complete Verdict. Calibration is not an optional add-on."],
    ["Commercial terms", "USD 5,500 fixed; 50% on criteria lock, 50% on delivery. Currency and confidentiality terms are confirmed in the signed engagement letter."],
    ["Scope change", "Additional finalists, a second role, or a rubric change after lock is a written variation."],
    ["Claims", "Do not promise that disagreement will be resolved, that bias is eliminated, or that the method predicts performance."],
    ["Decision", "Name the human recommendation owner, and repeat that the employer decides."],
    ["Evidence", "Do not cite a number without its source and its limits."],
    ["Product boundary", "No app, portal, ranking feature or model-generated recommendation is required to deliver the service."],
  ]),
  ...callout("The promise", ["Calibre promises a disciplined record of where the panel agrees, where it differs, what evidence bears on the difference, what remains uncertain, and who owns the final decision."]),
  ...useStatement(),
]);

// ================================================================ 5. Panel scoring guide
const scoringGuide = () => build("Calibre_Panel_Scoring_Guide.docx", "Panel scoring guide", [
  wordmark(), eyebrow("Panel scoring guide"),
  title("Independent scoring before reveal"),
  lede("Every panelist scores every finalist against the same locked rubric. Scores stay hidden until every panelist has submitted, or the scoring deadline has passed."),
  ...section("01", "Scoring rules"),
  ...table(["Score", "Meaning", "Required record"], [
    ["0", "No usable evidence", "Name the missing evidence and what would resolve it."],
    ["1", "Falls materially short of the anchor", "Cite the job-related evidence."],
    ["2", "Between anchors 1 and 3", "Explain why the evidence does not reach 3."],
    ["3", "Meets the role requirement", "Cite the evidence that satisfies the anchor."],
    ["4", "Between anchors 3 and 5", "Explain the additional relevant evidence."],
    ["5", "Exceeds the role requirement", "Cite the evidence that satisfies anchor 5."],
  ], [900, 3400, 4884], { keyCol: true }),
  ...section("02", "Evidence notes"),
  ...bullets([
    "Write at least 40 characters for every score, including 0.",
    "Name the evidence source and its date where available.",
    "Separate a demonstrated weakness from missing evidence.",
    "Do not infer protected characteristics, personality, culture fit or future performance.",
    "Do not discuss scores with other panelists before submission.",
    "After submission the record is immutable. Corrections are appended with a reason.",
  ]),
  ...callout("Good evidence note", ["C2, score 3. Owned the monthly close for a five-entity group, stated in the CV and supported by the panel interview note dated [date]. The evidence supports the anchor but does not establish listed-group reporting."]),
  ...callout("Insufficient evidence note", ["Good communicator and seems like a strong fit."], { rule: C.stone500, fill: C.paper100 }),
  ...section("03", "Panelist submission"),
  ...kv([["Panelist name", blank], ["Finalist reference", blank], ["Rubric version", blank], ["Submitted at", blank],
    ["All criteria scored", "Yes / No"], ["Every score has an evidence note", "Yes / No"], ["Scored independently", "Yes / No"], ["Signature", blank]], 3600),
  ...section("04", "Before reveal"),
  ...bullets([
    "The Calibre lead confirms every required panelist has submitted, or that the scoring deadline has passed.",
    "No weighted total, comparison or other panelist's score is shown before reveal.",
    "Late evidence is logged and applied consistently to every affected panelist.",
    "The comparison stays in finalist reference order and is never colour-coded as an order of merit.",
  ]),
  note("Scores are entered on sheet 02 of the Calibre Verdict working file only after reveal."),
  ...useStatement(),
]);

// ================================================================ 6. Calibration record
const calibrationRecord = () => build("Calibre_Calibration_Record.docx", "Calibration record", [
  wordmark(), eyebrow("Calibration record"),
  title("Resolve the differences, keep the original record"),
  lede("Calibration is required. The panel discusses every flagged finalist-criterion cell, records what caused the difference, and keeps both the pre-calibration scores and the final result."),
  ...section("01", "Session record"),
  ...kv([["Client and role", blank], ["Rubric version", blank], ["Session date", blank], ["Facilitator", blank], ["Panelists present", blank], ["Evidence cut-off", blank]]),
  ...section("02", "Flagged cells"),
  body("A spread of 2 is a divergence. A spread of 3 or 4 is a contradiction, and each one is named in the Verdict. The flagged cells are listed on sheet 03 of the working file."),
  body("Cause, circle one: E different evidence, A different reading of the anchor, W weighting, M missing evidence. Where more cells are flagged, continue on sheet 04 of the working file."),
  ...table(["#", "Finalist", "Criterion", "Scores", "Spread", "Cause", "Evidence discussed", "Resolution"],
    Array.from({ length: 8 }, (_, i) => [String(i + 1), "", "", "", "", "E  A  W  M", "", ""]),
    [480, 1000, 1150, 1000, 940, 1000, 1807, 1807], { keyCol: true, inputCols: [5] }),
  ...section("03", "Post-calibration record"),
  ...table(["Finalist", "Criterion", "Scores before", "Agreed score", "Remaining difference", "Note"],
    Array.from({ length: 5 }, () => ["", "", "", "", "", ""]), [1100, 1300, 1300, 1100, 1700, 2684]),
  note("Unresolved cells take the panel mean, rounded to the nearest whole number with ties rounding down, and are carried into the Verdict as a risk."),
  ...section("04", "Panel conclusions"),
  ...kv([["Where the panel agrees", blank], ["Where the panel still differs", blank], ["Evidence that would resolve open points", blank],
    ["Risks to name in the Verdict", blank], ["Recommendation owner", "named human decision-maker"], ["Employer decision owner", blank]], 3400),
  ...section("05", "Completion check"),
  ...table(["Check", "Status"], [
    ["All flagged cells discussed", "Complete / Open"], ["Pre-calibration record retained", "Complete / Open"],
    ["Post-calibration scores recorded", "Complete / Open"], ["Remaining disagreement stated plainly", "Complete / Open"],
    ["No order-of-merit labels or hidden sorting used", "Complete / Open"], ["Verdict writer briefed", "Complete / Open"],
  ], [5600, 3584], { keyCol: true, inputCols: [1] }),
  ...useStatement(),
]);

// ================================================================ 7. Candidate notice and data record
const noticeRecord = () => build("Calibre_Candidate_Notice_and_Data_Record.docx", "Candidate notice and data record", [
  wordmark(), eyebrow("Candidate notice and data record"),
  title("Use before candidate information enters the review"),
  lede("A plain-language notice for the client to adapt, and the minimum operational facts Calibre needs to record. It does not replace the client's privacy notice or legal review."),
  ...section("01", "Candidate notice template"),
  ...callout("Template for the client to send", [
    "[Client] is using Calibre by Daftar to help its hiring panel review job-related evidence for the [role] recruitment process. The service organises information already supplied through the hiring process against criteria agreed for this role. Human panelists make the assessments and [client] makes the hiring decision. Calibre does not use psychometric testing, personality profiling, culture-fit scoring, automated candidate ranking, or an automated hiring decision.",
    "Information used may include your CV, work history, interview notes, interview scores, and job-related work samples supplied by [client]. It is shared only with authorised members of the hiring process and handled for the retention period stated by [client]. To ask about access, correction, deletion, or a reasonable adjustment, contact [client contact and method].",
  ]),
  ...section("02", "Notice record"),
  ...table(["Finalist", "Notice version", "Sent date", "Method", "Client owner", "Confirmed"],
    ["K1", "K2", "K3", "K4", "K5", "K6"].map((k) => [k, "", "", "", "", "Yes / No"]), [1000, 1500, 1500, 1600, 2084, 1500], { keyCol: true, inputCols: [5] }),
  ...section("03", "Reasonable adjustment record"),
  body("Record only the operational adjustment. Never record medical information, and never record the reason in the rubric, the scoring file, the calibration record or the Verdict."),
  ...table(["Finalist", "Adjustment", "Applies to", "Owner", "Completed"],
    Array.from({ length: 6 }, () => ["", "", "", "", "Yes / No"]), [1000, 3200, 2000, 1584, 1400], { inputCols: [4] }),
  ...section("04", "Retention and deletion"),
  ...kv([["Verdict issue date", blank], ["Default purge date", "90 days after issue"], ["Approved different schedule and basis", blank],
    ["Systems and locations checked", blank], ["Deletion completed by", blank], ["Deletion completed at", blank],
    ["Post-purge identifier", "Initials or a non-identifying finalist reference only"]], 3400),
  ...useStatement(),
]);

Promise.all([rateCard(), intake(), memo(), serviceDefinition(), scoringGuide(), calibrationRecord(), noticeRecord()])
  .catch((e) => { console.error(e); process.exit(1); });
