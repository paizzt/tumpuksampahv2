import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { statSync, renameSync, rmSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'src', 'assets');

const jobs = [
  // Workflow illustrations: PNG -> JPEG q80, no transparency needed
  { input: 'workflow-img-1.png', output: 'workflow-img-1.jpg', op: (s) => s.jpeg({ quality: 80, mozjpeg: true }) },
  { input: 'workflow-img-2.png', output: 'workflow-img-2.jpg', op: (s) => s.jpeg({ quality: 80, mozjpeg: true }) },
  { input: 'workflow1-rev.png', output: 'workflow1-rev.jpg', op: (s) => s.jpeg({ quality: 80, mozjpeg: true }) },
  // Hero background: compress JPEG
  { input: 'hero1.jpg', output: 'hero1.jpg', op: (s) => s.jpeg({ quality: 72, mozjpeg: true }) },
  // Partner logos: resize to max height 300, compress JPEG
  { input: 'logo-mama.jpg', output: 'logo-mama.jpg', op: (s) => s.resize({ height: 300, withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }) },
  { input: 'logo-citra-garden.jpg', output: 'logo-citra-garden.jpg', op: (s) => s.resize({ height: 300, withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }) },
  { input: 'logo-rappo.jpg', output: 'logo-rappo.jpg', op: (s) => s.resize({ height: 300, withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }) },
  { input: 'logo-dlh-makassar.jpg', output: 'logo-dlh-makassar.jpg', op: (s) => s.resize({ height: 300, withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }) },
  { input: 'logo-sentra.png', output: 'logo-sentra.jpg', op: (s) => s.resize({ height: 300, withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 85, mozjpeg: true }) },
  { input: 'logo-sofi.jpg', output: 'logo-sofi.jpg', op: (s) => s.resize({ height: 300, withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }) },
  { input: 'logo-no5.png', output: 'logo-no5.jpg', op: (s) => s.resize({ height: 300, withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 85, mozjpeg: true }) },
];

function kb(p) {
  try { return (statSync(p).size / 1024).toFixed(1) + ' KB'; }
  catch { return 'n/a'; }
}

for (const job of jobs) {
  const inPath = join(assetsDir, job.input);
  const outPath = join(assetsDir, job.output);
  const tmpPath = outPath + '.tmp';
  try {
    const before = kb(inPath);
    await job.op(sharp(inPath)).toFile(tmpPath);
    if (outPath === inPath) {
      rmSync(inPath);
    }
    renameSync(tmpPath, outPath);
    console.log(`✓ ${job.input} (${before}) -> ${job.output} (${kb(outPath)})`);
  } catch (err) {
    try { rmSync(tmpPath); } catch {}
    console.error(`✗ ${job.input}: ${err.message}`);
  }
}

console.log('Optimization done.');
