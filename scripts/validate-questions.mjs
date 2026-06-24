#!/usr/bin/env node
// Validates the Airframe FAA Practice Test question file.
// Asserts for EVERY question: exactly 3 entries in `a`; `c` is an integer 0/1/2;
// non-empty `id`, `q`, `exp`; no duplicate `id`s.
// Prints a PASS/FAIL summary and exits non-zero on failure.

import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(__dirname, '../src/data/airframe/airframe-faa-practice-test.js');

const { questions } = await import(target);

const errors = [];
const seen = new Map();

if (!Array.isArray(questions)) {
  console.error('FAIL: `questions` is not an array.');
  process.exit(1);
}

questions.forEach((q, i) => {
  const where = `index ${i} (id=${q && q.id ? q.id : 'MISSING'})`;

  if (!q || typeof q !== 'object') {
    errors.push(`${where}: not an object`);
    return;
  }

  if (!q.id || typeof q.id !== 'string' || q.id.trim() === '') {
    errors.push(`${where}: empty/invalid id`);
  } else {
    if (seen.has(q.id)) {
      errors.push(`${where}: duplicate id (also at index ${seen.get(q.id)})`);
    } else {
      seen.set(q.id, i);
    }
  }

  if (!q.q || typeof q.q !== 'string' || q.q.trim() === '') {
    errors.push(`${where}: empty/invalid q`);
  }

  if (!q.exp || typeof q.exp !== 'string' || q.exp.trim() === '') {
    errors.push(`${where}: empty/invalid exp`);
  }

  if (!Array.isArray(q.a) || q.a.length !== 3) {
    errors.push(`${where}: \`a\` must have exactly 3 entries (got ${Array.isArray(q.a) ? q.a.length : typeof q.a})`);
  } else if (q.a.some((x) => typeof x !== 'string' || x.trim() === '')) {
    errors.push(`${where}: \`a\` contains empty/non-string entry`);
  }

  if (!Number.isInteger(q.c) || q.c < 0 || q.c > 2) {
    errors.push(`${where}: \`c\` must be integer 0/1/2 (got ${JSON.stringify(q.c)})`);
  }
});

console.log('--------------------------------------------------');
console.log(`Validating: ${path.relative(process.cwd(), target)}`);
console.log(`Total questions: ${questions.length}`);
console.log(`Unique ids:      ${seen.size}`);
console.log('--------------------------------------------------');

if (errors.length > 0) {
  console.error(`FAIL: ${errors.length} problem(s) found:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

console.log(`PASS: all ${questions.length} questions valid.`);
process.exit(0);
