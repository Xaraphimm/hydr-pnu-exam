# FAA Handbook PDF Integration — Design Spec

**Date:** 2026-04-04
**Status:** Approved
**Author:** xaraphimm + Claude

## Overview

Integrate FAA-H-8083-31B (Aviation Maintenance Technician Handbook — Airframe) into the PHNX A&P Exam Prep app. The 1052-page, 108MB source PDF is split at build time into per-subtopic chapter files. The existing `PdfViewer` component loads the relevant chapter when a user enters Study mode for any Airframe subtopic.

Powerplant subtopics are excluded — they require FAA-H-8083-32B, which is not yet available.

## Subtopic → Page Mapping

Source: `books/FAA-H-8083-31B_Aviation_Maintenance_Technician_Handbook.pdf`

| Subtopic | Chapter(s) | Page Ranges |
|----------|-----------|-------------|
| AF-01 Metallic Structures | Ch.1 Aircraft Structures + Ch.4 Metal Structural Repair | 27-71, 163-276 |
| AF-02 Non-Metallic Structures | Ch.3 Fabric + Ch.6 Wood + Ch.7 Composites | 139-162, 312-395 |
| AF-03 Flight Controls | Ch.2 Aerodynamics, Assembly & Rigging | 72-138 |
| AF-04 Airframe Inspection | Ch.2 (shared — includes inspection section) | 72-138 |
| AF-05 Landing Gear Systems | Ch.13 Aircraft Landing Gear Systems | 732-823 |
| AF-06 Hydraulic & Pneumatic | Ch.12 Hydraulic & Pneumatic Power Systems | 680-731 |
| AF-07 Environmental Systems | Ch.16 Cabin Environmental Control Systems | 912-972 |
| AF-08 Instrument Systems | Ch.10 Aircraft Systems | 520-603 |
| AF-09 Comm & Nav Systems | Ch.11 Communication & Navigation | 604-679 |
| AF-10 Fuel Systems | Ch.14 Aircraft Fuel Systems | 824-880 |
| AF-11 Electrical Systems | Ch.9 Aircraft Electrical System | 417-519 |
| AF-12 Ice & Rain Control | Ch.15 Ice & Rain Protection | 881-911 |
| AF-13 Fire Protection | Ch.17 Fire Protection Systems | 973-1052 |
| AF-14 Rotorcraft Fundamentals | Ch.2 (shared — rotorcraft sections) | 72-138 |
| AF-15 Water & Waste Systems | No coverage in this book | — |

**Notes:**
- AF-03, AF-04, and AF-14 all receive the full Ch.2 since their sections are interleaved.
- Ch.5 (Welding) and Ch.8 (Painting) are excluded — not mapped to ACS subtopics. Can be added later.
- AF-01 and AF-02 combine non-contiguous page ranges into single output PDFs.

## Changes

### 1. `scripts/split-pdfs.mjs`

- Change source path from iCloud to local `books/FAA-H-8083-31B_Aviation_Maintenance_Technician_Handbook.pdf`
- Populate CHAPTERS config with all 14 Airframe subtopic page ranges
- Support multiple page ranges per subtopic (array of `[start, end]` pairs) for AF-01 and AF-02
- Output to `public/pdfs/airframe/<slug>.pdf`

### 2. Version fix — pdfjs-dist / react-pdf alignment

- Pin `pdfjs-dist` to the version expected by `react-pdf@10.4.1` to resolve the "API version does not match Worker version" error
- Or remove explicit `pdfjs-dist` dependency and let `react-pdf` manage it internally

### 3. `src/data/topics.js`

- Verify `pdfFile` paths for AF-01 through AF-14 match the split output filenames
- Set AF-15 `pdfFile` to `null`

### 4. `src/components/PdfViewer.jsx`

- Handle `pdfFile: null` — show "No handbook chapter available for this topic" message
- No other changes needed

### 5. Build & test

- Run `npm run split-pdfs` to generate chapter PDFs
- Run `npm run dev` for local testing
- Commit split PDFs to repo

## What stays the same

- `asaPages` field in topics.js untouched
- All other components, routing, bookmarks, progress tracking unchanged
- Powerplant subtopics unchanged (no PDF source available)
- No new dependencies beyond fixing the pdfjs-dist version
