// Generates src/data/acs-codes.js from the official Aviation Mechanic ACS PDF.
//
// The PDF is the authoritative source for the element-level descriptions
// (Knowledge "K", Risk Management "R", and Skill "S" elements). The Area of
// Operation and Subject titles, plus the mapping from ACS subject to the app's
// study topics, are kept in a deterministic table below so section names stay
// stable even if the PDF text extraction shifts between revisions.
//
// Usage: node scripts/generate-acs-codes.mjs [path-to-acs.pdf]

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const DEFAULT_PDF = join(REPO_ROOT, 'public', 'pdfs', 'aviation-mechanic-acs.pdf');
const OUTPUT_FILE = join(REPO_ROOT, 'src', 'data', 'acs-codes.js');

const CODE_PATTERN = /^AM\.(I{1,3})\.([A-Z])\.([KRS])(\d+)$/;

// Area of Operation -> { title, category }
const AREAS = {
  'AM.I': { title: 'General', category: 'general' },
  'AM.II': { title: 'Airframe', category: 'airframe' },
  'AM.III': { title: 'Powerplant', category: 'powerplant' },
};

// Subject code -> { title, topicId }. Titles are taken verbatim from the PDF
// "Subject X." headers; topicId links to TOPICS in src/data/topics.js
// (null for General subjects, which have no study topic in the app).
const SUBJECTS = {
  // General (AM.I)
  'AM.I.A': { title: 'Fundamentals of Electricity and Electronics', topicId: null },
  'AM.I.B': { title: 'Aircraft Drawings', topicId: null },
  'AM.I.C': { title: 'Weight and Balance', topicId: null },
  'AM.I.D': { title: 'Fluid Lines and Fittings', topicId: null },
  'AM.I.E': { title: 'Aircraft Materials, Hardware, and Processes', topicId: null },
  'AM.I.F': { title: 'Ground Operations and Servicing', topicId: null },
  'AM.I.G': { title: 'Cleaning and Corrosion Control', topicId: null },
  'AM.I.H': { title: 'Mathematics', topicId: null },
  'AM.I.I': { title: 'Regulations, Maintenance Forms, Records, and Publications', topicId: null },
  'AM.I.J': { title: 'Physics for Aviation', topicId: null },
  'AM.I.K': { title: 'Inspection Concepts and Techniques', topicId: null },
  'AM.I.L': { title: 'Human Factors', topicId: null },
  // Airframe (AM.II)
  'AM.II.A': { title: 'Metallic Structures', topicId: 'AF-01' },
  'AM.II.B': { title: 'Non-Metallic Structures', topicId: 'AF-02' },
  'AM.II.C': { title: 'Flight Controls', topicId: 'AF-03' },
  'AM.II.D': { title: 'Airframe Inspection', topicId: 'AF-04' },
  'AM.II.E': { title: 'Landing Gear Systems', topicId: 'AF-05' },
  'AM.II.F': { title: 'Hydraulic and Pneumatic Systems', topicId: 'AF-06' },
  'AM.II.G': { title: 'Environmental Systems', topicId: 'AF-07' },
  'AM.II.H': { title: 'Aircraft Instrument Systems', topicId: 'AF-08' },
  'AM.II.I': { title: 'Communication and Navigation Systems', topicId: 'AF-09' },
  'AM.II.J': { title: 'Aircraft Fuel Systems', topicId: 'AF-10' },
  'AM.II.K': { title: 'Aircraft Electrical Systems', topicId: 'AF-11' },
  'AM.II.L': { title: 'Ice and Rain Control Systems', topicId: 'AF-12' },
  'AM.II.M': { title: 'Airframe Fire Protection Systems', topicId: 'AF-13' },
  'AM.II.N': { title: 'Rotorcraft Fundamentals', topicId: 'AF-14' },
  'AM.II.O': { title: 'Water and Waste Systems', topicId: 'AF-15' },
  // Powerplant (AM.III)
  'AM.III.A': { title: 'Reciprocating Engines', topicId: 'PP-01' },
  'AM.III.B': { title: 'Turbine Engines', topicId: 'PP-02' },
  'AM.III.C': { title: 'Engine Inspection', topicId: 'PP-03' },
  'AM.III.D': { title: 'Engine Instrument Systems', topicId: 'PP-04' },
  'AM.III.E': { title: 'Engine Fire Protection Systems', topicId: 'PP-05' },
  'AM.III.F': { title: 'Engine Electrical Systems', topicId: 'PP-06' },
  'AM.III.G': { title: 'Engine Lubrication Systems', topicId: 'PP-07' },
  'AM.III.H': { title: 'Ignition and Starting Systems', topicId: 'PP-08' },
  'AM.III.I': { title: 'Engine Fuel and Fuel Metering Systems', topicId: 'PP-09' },
  'AM.III.J': { title: 'Reciprocating Engine Induction and Cooling Systems', topicId: 'PP-10' },
  'AM.III.K': { title: 'Turbine Engine Air Systems', topicId: 'PP-11' },
  'AM.III.L': { title: 'Engine Exhaust and Reverser Systems', topicId: 'PP-12' },
  'AM.III.M': { title: 'Propellers', topicId: 'PP-13' },
};

async function extractLines(pdfPath) {
  const data = new Uint8Array(await readFile(pdfPath));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const lines = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();

    // Group text items into visual lines by y position. A code and its
    // description can sit on baselines that differ by a fraction of a point
    // (which naive rounding would split), while distinct rows are ~19 points
    // apart, so cluster within a small tolerance.
    const items = content.items
      .filter((item) => 'str' in item && item.str.length)
      .map((item) => ({ x: item.transform[4], y: item.transform[5], str: item.str }))
      .sort((a, b) => b.y - a.y || a.x - b.x);

    const Y_TOLERANCE = 5;
    const clusters = [];
    for (const item of items) {
      const cluster = clusters[clusters.length - 1];
      if (cluster && Math.abs(item.y - cluster.y) <= Y_TOLERANCE) {
        cluster.items.push(item);
      } else {
        clusters.push({ y: item.y, items: [item] });
      }
    }

    for (const cluster of clusters) {
      const text = cluster.items
        .sort((a, b) => a.x - b.x)
        .map((item) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) lines.push(text);
    }
  }

  await doc.cleanup();
  return lines;
}

// Phrases that mark the start of the next ACS block; if PDF line grouping
// merges them onto an element's line they must be trimmed off the description.
const BOUNDARY_PATTERN =
  /\b(?:Risk Management The applicant|Skills? The applicant|Knowledge The applicant|Objective The following|Subject [A-Z]\.)/;

function cleanDescription(text) {
  let value = text.replace(/\s+/g, ' ').trim();
  // Cut at a following ACS block header that bled into this line.
  value = value.split(BOUNDARY_PATTERN)[0];
  // Drop trailing page-number / footer artifacts (no real element ends in a
  // digit in the source document).
  value = value.replace(/\s+\d{1,3}$/, '').replace(/\s+/g, ' ').trim();
  return value;
}

const CODE_TOKEN = /AM\.I{1,3}\.[A-Z]\.[KRS]\d+/g;

function buildElements(lines) {
  const elements = {};

  for (const line of lines) {
    const matches = [...line.matchAll(CODE_TOKEN)];
    if (matches.length === 0) continue;

    // A reconstructed PDF line can contain more than one code, so split the
    // line into per-code segments rather than only reading a leading code.
    for (let i = 0; i < matches.length; i += 1) {
      const code = matches[i][0];
      if (!CODE_PATTERN.test(code)) continue;

      const start = matches[i].index + code.length;
      const end = i + 1 < matches.length ? matches[i + 1].index : line.length;
      const description = cleanDescription(line.slice(start, end));
      if (!description) continue;

      // Prefer the richer description if a code appears more than once
      // (e.g. table of contents vs. body).
      if (!elements[code] || description.length > elements[code].length) {
        elements[code] = description;
      }
    }
  }

  return elements;
}

function parseCode(code) {
  const match = code.match(CODE_PATTERN);
  if (!match) return null;
  const [, area, letter, type, num] = match;
  return {
    area: `AM.${area}`,
    subject: `AM.${area}.${letter}`,
    type,
    num: Number(num),
  };
}

function serialize(obj, indent = 2) {
  const pad = ' '.repeat(indent);
  const entries = Object.entries(obj).map(([key, value]) => {
    return `${pad}${JSON.stringify(key)}: ${JSON.stringify(value)},`;
  });
  return `{\n${entries.join('\n')}\n}`;
}

async function main() {
  const pdfPath = process.argv[2] ? resolve(process.argv[2]) : DEFAULT_PDF;
  console.log(`Reading ACS PDF: ${pdfPath}`);

  const lines = await extractLines(pdfPath);
  const descriptions = buildElements(lines);

  const elements = {};
  const subjectsSeen = new Set();
  let skipped = 0;

  for (const code of Object.keys(descriptions).sort(byCode)) {
    const parsed = parseCode(code);
    if (!parsed) {
      skipped += 1;
      continue;
    }
    if (!SUBJECTS[parsed.subject]) {
      console.warn(`Skipping code with unknown subject: ${code}`);
      skipped += 1;
      continue;
    }
    subjectsSeen.add(parsed.subject);
    elements[code] = {
      type: parsed.type,
      subject: parsed.subject,
      text: descriptions[code],
    };
  }

  const subjects = {};
  for (const [code, info] of Object.entries(SUBJECTS)) {
    const area = code.split('.').slice(0, 2).join('.');
    subjects[code] = { title: info.title, area, topicId: info.topicId };
  }

  const elementCount = Object.keys(elements).length;
  const header = `// AUTO-GENERATED by scripts/generate-acs-codes.mjs. Do not edit by hand.
// Source: public/pdfs/aviation-mechanic-acs.pdf (FAA-S-ACS-1).
// Run \`node scripts/generate-acs-codes.mjs\` to regenerate.`;

  const body = `${header}

export const ACS_AREAS = ${serialize(AREAS)};

export const ACS_SUBJECTS = ${serialize(subjects)};

export const ACS_ELEMENTS = ${serialize(elements)};

const SUBJECT_KEYS = Object.keys(ACS_SUBJECTS);
const AREA_KEYS = Object.keys(ACS_AREAS);

export function normalizeAcsCode(code) {
  return String(code ?? '').trim().toUpperCase();
}

// Resolves a full element code, a subject prefix (AM.II.E), or an area prefix
// (AM.II) to its section metadata. Returns null when the input is not a
// recognized ACS code.
export function resolveAcsCode(code) {
  const normalized = normalizeAcsCode(code);
  if (!normalized) return null;

  const element = ACS_ELEMENTS[normalized] ?? null;
  if (element) {
    const subject = ACS_SUBJECTS[element.subject] ?? null;
    return {
      code: normalized,
      kind: 'element',
      area: subject ? subject.area : null,
      areaTitle: subject ? (ACS_AREAS[subject.area]?.title ?? null) : null,
      subject: element.subject,
      subjectTitle: subject ? subject.title : null,
      topicId: subject ? subject.topicId : null,
      element,
    };
  }

  const subject = ACS_SUBJECTS[normalized] ?? null;
  if (subject) {
    return {
      code: normalized,
      kind: 'subject',
      area: subject.area,
      areaTitle: ACS_AREAS[subject.area]?.title ?? null,
      subject: normalized,
      subjectTitle: subject.title,
      topicId: subject.topicId,
      element: null,
    };
  }

  const area = ACS_AREAS[normalized] ?? null;
  if (area) {
    return {
      code: normalized,
      kind: 'area',
      area: normalized,
      areaTitle: area.title,
      subject: null,
      subjectTitle: null,
      topicId: null,
      element: null,
    };
  }

  return null;
}

export function getTopicIdForAcsCode(code) {
  return resolveAcsCode(code)?.topicId ?? null;
}

export function isKnownAcsCode(code) {
  return resolveAcsCode(code) !== null;
}

export { SUBJECT_KEYS, AREA_KEYS };
`;

  await writeFile(OUTPUT_FILE, body, 'utf8');

  console.log(`Wrote ${OUTPUT_FILE}`);
  console.log(`  areas:    ${Object.keys(AREAS).length}`);
  console.log(`  subjects: ${Object.keys(subjects).length} (with elements: ${subjectsSeen.size})`);
  console.log(`  elements: ${elementCount}`);
  if (skipped) console.log(`  skipped:  ${skipped}`);
}

function byCode(a, b) {
  const pa = parseCode(a);
  const pb = parseCode(b);
  if (!pa || !pb) return a.localeCompare(b);
  if (pa.area !== pb.area) return AREA_ORDER[pa.area] - AREA_ORDER[pb.area];
  if (pa.subject !== pb.subject) return pa.subject.localeCompare(pb.subject);
  if (pa.type !== pb.type) return TYPE_ORDER[pa.type] - TYPE_ORDER[pb.type];
  return pa.num - pb.num;
}

const AREA_ORDER = { 'AM.I': 0, 'AM.II': 1, 'AM.III': 2 };
const TYPE_ORDER = { K: 0, R: 1, S: 2 };

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
