#!/usr/bin/env node
// Validates every loaded practice-question bank.
// The validator is intentionally strict on fields that affect scoring and source
// traceability, and advisory on duplicate stems because some official banks use
// repeated wording with different answer sets.

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const diagramsIndex = path.resolve(rootDir, 'src/diagrams/index.js');

const { CATEGORIES, TOPICS, loadAllQuestions } = await import(
  path.resolve(rootDir, 'src/data/index.js')
);
const { getQuestionFigure } = await import(
  path.resolve(rootDir, 'src/utils/question-figures.js')
);

const errors = [];
const warnings = [];
const seen = new Map();

function expectedPrefix(topicId) {
  if (topicId === 'AF-PRACTICE') return 'AF-';
  return `${topicId.replace('-', '')}-`;
}

function getCategoryForTopic(topicId) {
  return TOPICS[topicId]?.category ?? null;
}

function getExpectedAcsPrefix(topicId) {
  const category = getCategoryForTopic(topicId);
  if (category === 'airframe') return 'AM.II.';
  if (category === 'powerplant') return 'AM.III.';
  return 'AM.';
}

function normalizeStem(text) {
  return String(text ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function normalizeAnswer(text) {
  return normalizeStem(text).replace(/[.;:]+$/u, '');
}

function getKnownDiagramNames() {
  if (!fs.existsSync(diagramsIndex)) return new Set();

  const source = fs.readFileSync(diagramsIndex, 'utf8');
  const objectMatch = source.match(/const\s+diagrams\s*=\s*\{([\s\S]*?)\n\}/u);
  if (!objectMatch) return new Set();

  return new Set(
    [...objectMatch[1].matchAll(/^\s*([A-Za-z_$][\w$]*)\s*:/gmu)].map((match) => match[1])
  );
}

const knownDiagramNames = getKnownDiagramNames();
const allQuestions = await loadAllQuestions();

const stemMap = new Map();
let totalQuestions = 0;

for (const [topicId, questions] of Object.entries(allQuestions)) {
  if (!Array.isArray(questions)) {
    errors.push(`${topicId}: questions export must be an array`);
    continue;
  }

  if (questions.length === 0) {
    errors.push(`${topicId}: questions export must not be empty`);
    continue;
  }

  const prefix = expectedPrefix(topicId);
  const acsPrefix = getExpectedAcsPrefix(topicId);

  questions.forEach((q, i) => {
    totalQuestions++;
    const where = `${topicId}[${i}] (id=${q && q.id ? q.id : 'MISSING'})`;

    if (!q || typeof q !== 'object') {
      errors.push(`${where}: not an object`);
      return;
    }

    if (!q.id || typeof q.id !== 'string' || q.id.trim() === '') {
      errors.push(`${where}: empty/invalid id`);
    } else {
      if (!q.id.startsWith(prefix)) {
        errors.push(`${where}: id must start with ${prefix}`);
      }

      if (seen.has(q.id)) {
        errors.push(`${where}: duplicate id (also at ${seen.get(q.id)})`);
      } else {
        seen.set(q.id, where);
      }
    }

    if (!q.q || typeof q.q !== 'string' || q.q.trim() === '') {
      errors.push(`${where}: empty/invalid q`);
    } else {
      const stem = normalizeStem(q.q);
      const correctAnswer = Array.isArray(q.a) && Number.isInteger(q.c)
        ? normalizeAnswer(q.a[q.c])
        : '';
      const existing = stemMap.get(stem);

      if (existing && existing.correctAnswer !== correctAnswer) {
        warnings.push(
          `${where}: duplicate stem with different correct answer text (also at ${existing.where})`
        );
      }

      if (!existing) {
        stemMap.set(stem, { where, correctAnswer });
      }
    }

    if (!q.exp || typeof q.exp !== 'string' || q.exp.trim() === '') {
      errors.push(`${where}: empty/invalid exp`);
    }

    if (typeof q.ref !== 'string' || q.ref.trim() === '') {
      errors.push(`${where}: empty/invalid ref`);
    }

    if (typeof q.acs !== 'string' || q.acs.trim() === '') {
      errors.push(`${where}: empty/invalid acs`);
    } else {
      if (!q.acs.startsWith(acsPrefix)) {
        errors.push(`${where}: acs must start with ${acsPrefix} (got ${q.acs})`);
      }

      if (!/^AM\.(II|III)\.[A-Z]\.K\d+[A-Z]?$/u.test(q.acs)) {
        errors.push(`${where}: acs has unexpected format (${q.acs})`);
      }
    }

    if (!Array.isArray(q.a) || q.a.length !== 3) {
      errors.push(`${where}: \`a\` must have exactly 3 entries (got ${Array.isArray(q.a) ? q.a.length : typeof q.a})`);
    } else if (q.a.some((x) => typeof x !== 'string' || x.trim() === '')) {
      errors.push(`${where}: \`a\` contains empty/non-string entry`);
    }

    if (!Number.isInteger(q.c) || q.c < 0 || q.c > 2) {
      errors.push(`${where}: \`c\` must be integer 0/1/2 (got ${JSON.stringify(q.c)})`);
    }

    if (q.diagram !== null && q.diagram !== undefined) {
      if (typeof q.diagram !== 'string' || q.diagram.trim() === '') {
        errors.push(`${where}: diagram must be null or a non-empty string`);
      } else if (!knownDiagramNames.has(q.diagram) && !getQuestionFigure(q, getCategoryForTopic(topicId))) {
        warnings.push(`${where}: diagram "${q.diagram}" is not exported from src/diagrams/index.js`);
      }
    }

    if (q.figure !== null && q.figure !== undefined) {
      if (typeof q.figure !== 'object' || typeof q.figure.src !== 'string' || q.figure.src.trim() === '') {
        errors.push(`${where}: figure must be null/undefined or an object with a non-empty src`);
      }
    }
  });
}

console.log('--------------------------------------------------');
console.log('Validating loaded question banks');
console.log(`Topics loaded:    ${Object.keys(allQuestions).length}`);
console.log(`Total questions: ${totalQuestions}`);
console.log(`Unique ids:      ${seen.size}`);
console.log(`Unique stems:    ${stemMap.size}`);
console.log('--------------------------------------------------');

if (warnings.length > 0) {
  console.warn(`WARN: ${warnings.length} duplicate-stem warning(s):`);
  for (const warning of warnings.slice(0, 50)) console.warn('  - ' + warning);
  if (warnings.length > 50) console.warn(`  ... ${warnings.length - 50} more warning(s) not shown`);
  console.log('--------------------------------------------------');
}

if (errors.length > 0) {
  console.error(`FAIL: ${errors.length} problem(s) found:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

console.log(`PASS: all ${totalQuestions} questions valid.`);
process.exit(0);
