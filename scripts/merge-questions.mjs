#!/usr/bin/env node
// Merges all scripts/ocr-batches/batch-*.mjs files into the final
// src/data/airframe/airframe-faa-practice-test.js, deduping by id and
// sorting by the numeric book question number.

import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchDir = path.resolve(__dirname, 'ocr-batches');
const outFile = path.resolve(__dirname, '../src/data/airframe/airframe-faa-practice-test.js');

const files = fs
  .readdirSync(batchDir)
  .filter((f) => /^batch-\d+\.mjs$/.test(f))
  .sort();

const byId = new Map();
let totalRead = 0;
const perFile = [];

for (const f of files) {
  const mod = await import(pathToFileURL(path.join(batchDir, f)).href);
  const qs = Array.isArray(mod.questions) ? mod.questions : [];
  perFile.push(`${f}: ${qs.length}`);
  for (const q of qs) {
    totalRead++;
    if (!q || !q.id) continue;
    if (!byId.has(q.id)) byId.set(q.id, q);
  }
}

const merged = [...byId.values()];

const numOf = (q) => {
  const m = String(q.id).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
};
merged.sort((a, b) => numOf(a) - numOf(b));

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const fmtStr = (s) => `"${esc(s)}"`;
const fmtNullable = (s) => (s === null || s === undefined ? 'null' : fmtStr(s));

const lines = ['export const questions = ['];
for (const q of merged) {
  const a = `[${q.a.map((x) => fmtStr(x)).join(', ')}]`;
  lines.push(
    `  {\n` +
      `    id: ${fmtStr(q.id)},\n` +
      `    q: ${fmtStr(q.q)},\n` +
      `    a: ${a},\n` +
      `    c: ${q.c},\n` +
      `    exp: ${fmtStr(q.exp)},\n` +
      `    ref: ${fmtNullable(q.ref)},\n` +
      `    acs: ${fmtNullable(q.acs)},\n` +
      `    diagram: ${fmtNullable(q.diagram)},\n` +
      `  },`
  );
}
lines.push('];', '');

fs.writeFileSync(outFile, lines.join('\n'), 'utf8');

console.log('Batch files merged:');
for (const p of perFile) console.log('  ' + p);
console.log(`Total objects read: ${totalRead}`);
console.log(`Unique after dedupe: ${merged.length}`);
console.log(`Wrote: ${path.relative(process.cwd(), outFile)}`);
