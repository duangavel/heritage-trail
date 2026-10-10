// Copies the photos listed in src/data/photos.json from the local images/ folder into src/assets/photos/.
//
// Each photo's "source" is its path inside images/ (the originals stay there and are never committed).
// Copies are resized to at most 2000px on the long edge and stripped of camera metadata, including GPS;
// Astro then makes the phone-sized versions at build time.
//
// usage: npm run photos            copy any photos that are missing
//        npm run photos -- --force re-copy every photo
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const force = process.argv.includes("--force");
const data = JSON.parse(fs.readFileSync(path.join(root, "src/data/photos.json"), "utf8"));

const all = Object.values(data.stops).flatMap((s) => [s.lead, ...s.events.flatMap((e) => e.photos)]).filter(Boolean);
let copied = 0, skipped = 0;
const missing = [];
for (const p of all) {
  const dest = path.join(root, "src/assets/photos", p.file);
  if (!force && fs.existsSync(dest)) { skipped++; continue; }
  const src = path.join(root, "images", p.source);
  if (!fs.existsSync(src)) { missing.push(p.source); continue; }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(src)
    .rotate() // apply camera orientation before metadata is dropped
    .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(dest);
  copied++;
}
console.log(`Copied ${copied}, already present ${skipped}.`);
if (missing.length) {
  console.error(`Not found in images/:\n  ${missing.join("\n  ")}`);
  process.exitCode = 1;
}
