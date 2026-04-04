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
