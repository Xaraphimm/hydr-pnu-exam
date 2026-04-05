# FAA Handbook PDF Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split FAA-H-8083-31B into per-subtopic chapter PDFs and fix the PDF viewer so Airframe subtopics load their corresponding handbook chapters in Study mode.

**Architecture:** Build-time Node script splits the 108MB source PDF into 14 smaller per-subtopic files using `pdf-lib`. The existing `PdfViewer` component (react-pdf) loads them at runtime. Fix the pdfjs-dist version mismatch that currently prevents any PDF from loading.

**Tech Stack:** pdf-lib (splitting), react-pdf + pdfjs-dist (viewing), Vite (dev server)

---

### Task 1: Fix pdfjs-dist / react-pdf version mismatch

**Files:**
- Modify: `package.json` — pin pdfjs-dist to 5.4.296

The root cause: `react-pdf@10.4.1` bundles `pdfjs-dist@5.4.296` internally, but the top-level `pdfjs-dist@5.6.205` provides the worker. API v5.4.296 ≠ Worker v5.6.205 = crash.

- [ ] **Step 1: Pin pdfjs-dist to match react-pdf's bundled version**

```bash
npm install pdfjs-dist@5.4.296
```

Expected: package.json now shows `"pdfjs-dist": "^5.4.296"` and `node_modules/pdfjs-dist/package.json` shows version `5.4.296`.

- [ ] **Step 2: Verify the version alignment**

```bash
node -e "const rp = require('./node_modules/react-pdf/node_modules/pdfjs-dist/package.json'); const tl = require('./node_modules/pdfjs-dist/package.json'); console.log('react-pdf bundled:', rp.version, '| top-level:', tl.version); console.log(rp.version === tl.version ? 'MATCH' : 'MISMATCH')"
```

Expected: Both show `5.4.296` and `MATCH`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "fix: pin pdfjs-dist to 5.4.296 to match react-pdf bundled version"
```

---

### Task 2: Update split-pdfs.mjs with subtopic page ranges

**Files:**
- Modify: `scripts/split-pdfs.mjs`

- [ ] **Step 1: Rewrite split-pdfs.mjs**

Replace the entire file contents with:

```javascript
import { PDFDocument } from 'pdf-lib';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public', 'pdfs');
const AIRFRAME_PDF = join(__dirname, '..', 'books', 'FAA-H-8083-31B_Aviation_Maintenance_Technician_Handbook.pdf');

// Page ranges are 1-indexed, inclusive. Multiple ranges are merged into one output PDF.
const CHAPTERS = {
  airframe: {
    'metallic-structures':              { pages: [[27, 71], [163, 276]] },
    'non-metallic-structures':          { pages: [[139, 162], [312, 395]] },
    'flight-controls':                  { pages: [[72, 138]] },
    'airframe-inspection':              { pages: [[72, 138]] },
    'landing-gear-systems':             { pages: [[732, 823]] },
    'hydraulic-pneumatic-systems':      { pages: [[680, 731]] },
    'environmental-systems':            { pages: [[912, 972]] },
    'aircraft-instrument-systems':      { pages: [[520, 603]] },
    'communication-navigation-systems': { pages: [[604, 679]] },
    'aircraft-fuel-systems':            { pages: [[824, 880]] },
    'aircraft-electrical-systems':      { pages: [[417, 519]] },
    'ice-rain-control-systems':         { pages: [[881, 911]] },
    'airframe-fire-protection':         { pages: [[973, 1052]] },
    'rotorcraft-fundamentals':          { pages: [[72, 138]] },
  },
};

async function splitPdf(sourcePdf, pageRanges, outputPath) {
  const newPdf = await PDFDocument.create();
  for (const [start, end] of pageRanges) {
    const indices = [];
    for (let i = start - 1; i < end; i++) indices.push(i);
    const pages = await newPdf.copyPages(sourcePdf, indices);
    pages.forEach((p) => newPdf.addPage(p));
  }
  const bytes = await newPdf.save();
  const dir = dirname(outputPath);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(outputPath, bytes);
  const sizeMB = (bytes.length / 1024 / 1024).toFixed(1);
  console.log(`  ${outputPath.split('/pdfs/')[1]} — ${sizeMB} MB`);
}

async function main() {
  if (!existsSync(AIRFRAME_PDF)) {
    console.error(`Source PDF not found: ${AIRFRAME_PDF}`);
    console.error('Place FAA-H-8083-31B_Aviation_Maintenance_Technician_Handbook.pdf in the books/ directory.');
    process.exit(1);
  }

  console.log('Loading source PDF...');
  const sourceBytes = await readFile(AIRFRAME_PDF);
  const sourcePdf = await PDFDocument.load(sourceBytes);
  console.log(`Loaded ${sourcePdf.getPageCount()} pages\n`);

  for (const [category, chapters] of Object.entries(CHAPTERS)) {
    console.log(`${category.toUpperCase()}:`);
    for (const [name, config] of Object.entries(chapters)) {
      const outputPath = join(publicDir, category, `${name}.pdf`);
      await splitPdf(sourcePdf, config.pages, outputPath);
    }
  }
  console.log('\nDone!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Run the split script**

```bash
npm run split-pdfs
```

Expected output: 14 lines showing each airframe chapter being created with file sizes, e.g.:
```
Loading source PDF...
Loaded 1052 pages

AIRFRAME:
  airframe/metallic-structures.pdf — X.X MB
  airframe/non-metallic-structures.pdf — X.X MB
  ...
Done!
```

- [ ] **Step 3: Verify all 14 PDFs were created**

```bash
ls -lh public/pdfs/airframe/*.pdf | wc -l
ls -lh public/pdfs/airframe/*.pdf
```

Expected: 14 PDF files.

- [ ] **Step 4: Commit the script (not the PDFs yet)**

```bash
git add scripts/split-pdfs.mjs
git commit -m "feat: update split-pdfs script with FAA-H-8083-31B chapter ranges"
```

---

### Task 3: Update topics.js — set AF-15 pdfFile to null

**Files:**
- Modify: `src/data/topics.js:16`

The existing `pdfFile` paths in `topics.js` already match the filenames the split script produces (e.g., `/pdfs/airframe/hydraulic-pneumatic-systems.pdf`). The only change needed is AF-15, which has no handbook coverage.

- [ ] **Step 1: Set AF-15 pdfFile to null**

In `src/data/topics.js`, change line 16 from:

```javascript
  'AF-15': { id: 'AF-15', name: 'Water & Waste Systems', subtitle: 'Potable water, lavatory, waste disposal', category: 'airframe', pdfFile: '/pdfs/airframe/water-waste-systems.pdf', asaPages: [138, 138] },
```

to:

```javascript
  'AF-15': { id: 'AF-15', name: 'Water & Waste Systems', subtitle: 'Potable water, lavatory, waste disposal', category: 'airframe', pdfFile: null, asaPages: [138, 138] },
```

- [ ] **Step 2: Commit**

```bash
git add src/data/topics.js
git commit -m "fix: set AF-15 pdfFile to null (no handbook coverage)"
```

---

### Task 4: Handle null pdfFile in PdfViewer

**Files:**
- Modify: `src/components/PdfViewer.jsx`

- [ ] **Step 1: Add null-pdfFile guard**

In `src/components/PdfViewer.jsx`, add a guard before the main return. Insert after line 24 (after the `isPageBookmarked` function) and before the `if (error)` block at line 26:

```javascript
  if (!pdfFile) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-viewer__nav">
          <button className="pdf-viewer__back" onClick={onBack}>&larr;</button>
          <span>Study</span>
        </div>
        <div className="pdf-viewer__error">
          <p>No handbook chapter available for this topic.</p>
        </div>
      </div>
    );
  }
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PdfViewer.jsx
git commit -m "fix: handle null pdfFile gracefully in PdfViewer"
```

---

### Task 5: Commit split PDFs and test locally

**Files:**
- Add: `public/pdfs/airframe/*.pdf` (14 files)

- [ ] **Step 1: Remove .gitkeep placeholders**

```bash
rm -f public/pdfs/airframe/.gitkeep public/pdfs/powerplant/.gitkeep
```

- [ ] **Step 2: Add and commit the split PDFs**

```bash
git add public/pdfs/airframe/*.pdf
git commit -m "feat: add split FAA-H-8083-31B chapter PDFs for all airframe subtopics"
```

- [ ] **Step 3: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 4: Manual testing checklist**

Open the local URL in a browser and verify:

1. Navigate to any Airframe subtopic (e.g., AF-06 Hydraulic & Pneumatic) → tap Study → PDF loads without version mismatch error
2. Pages render, scroll works, page count displays
3. Bookmark a page → star icon turns filled → check Bookmarks tab shows it
4. Navigate to AF-15 Water & Waste → tap Study → shows "No handbook chapter available" message
5. Navigate to a Powerplant subtopic (e.g., PP-01) → tap Study → verify it doesn't crash (it will show the load error since no PP PDFs exist, which is expected)
6. Check that the back button returns to the subtopic screen

- [ ] **Step 5: Stop dev server and confirm done**
