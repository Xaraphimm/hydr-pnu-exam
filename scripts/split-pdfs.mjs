import { PDFDocument } from 'pdf-lib';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public', 'pdfs');

const AIRFRAME_PDF = join(process.env.HOME, 'Library/Mobile Documents/com~apple~CloudDocs/A&P/ATA_Airframe', 'FAA-H-8083-31B_Aviation_Maintenance_Technician_Handbook.pdf');
const POWERPLANT_PDF = join(process.env.HOME, 'Library/Mobile Documents/com~apple~CloudDocs/A&P/Powerplant', 'Aircraft Propulsion 2ed.pdf');

// Chapter page ranges (1-indexed, inclusive)
// Add more chapters as page ranges are determined from the actual textbooks
const CHAPTERS = {
  airframe: {
    // 'metallic-structures': { source: AIRFRAME_PDF, pages: [1, 50] },
  },
  powerplant: {
    // 'reciprocating-engines': { source: POWERPLANT_PDF, pages: [1, 30] },
  },
};

async function splitPdf(sourcePath, startPage, endPage, outputPath) {
  console.log(`  Extracting pages ${startPage}-${endPage} → ${outputPath}`);
  const sourceBytes = await readFile(sourcePath);
  const sourcePdf = await PDFDocument.load(sourceBytes);
  const newPdf = await PDFDocument.create();
  const indices = [];
  for (let i = startPage - 1; i < endPage; i++) indices.push(i);
  const pages = await newPdf.copyPages(sourcePdf, indices);
  pages.forEach((p) => newPdf.addPage(p));
  const bytes = await newPdf.save();
  const dir = dirname(outputPath);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(outputPath, bytes);
  console.log(`  Done (${bytes.length} bytes)`);
}

async function main() {
  for (const [category, chapters] of Object.entries(CHAPTERS)) {
    console.log(`\n${category.toUpperCase()}`);
    for (const [name, config] of Object.entries(chapters)) {
      if (!existsSync(config.source)) {
        console.log(`  Skipping ${name}: source PDF not found at ${config.source}`);
        continue;
      }
      const outputPath = join(publicDir, category, `${name}.pdf`);
      await splitPdf(config.source, config.pages[0], config.pages[1], outputPath);
    }
  }
  console.log('\nDone! Configure chapter page ranges in CHAPTERS to split more.');
}

main().catch(console.error);
