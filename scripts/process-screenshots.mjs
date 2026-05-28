import sharp from 'sharp'
import { readdir } from 'fs/promises'
import { resolve, dirname, extname, basename } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const inputDir = resolve(root, 'screenshots')
const outputDir = resolve(root, 'screenshots/processed')

// Adjust if the crop cuts too much or too little
const CROP_TOP = 90
const CROP_BOTTOM = 126

const files = (await readdir(inputDir))
  .filter(f => ['.jpg', '.jpeg', '.png'].includes(extname(f).toLowerCase()))

await Promise.all(files.map(async (file) => {
  const meta = await sharp(resolve(inputDir, file)).metadata()
  await sharp(resolve(inputDir, file))
    .extract({ left: 0, top: CROP_TOP, width: meta.width, height: meta.height - CROP_TOP - CROP_BOTTOM })
    .toFile(resolve(outputDir, basename(file, extname(file)) + '.png'))
}))

console.log(`Processed ${files.length} screenshot(s) → screenshots/processed/`)