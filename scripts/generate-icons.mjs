import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = resolve(root, 'resources/icon.svg')
const fontPath = resolve(root, 'resources/DelaGothicOne-Regular.ttf')

const webpSizes = [48, 72, 96, 128, 192, 256, 512]

const svg = readFileSync(svgPath, 'utf-8')
const resvg = new Resvg(svg, {
  font: {
    fontFiles: [fontPath],
    defaultFontFamily: 'Dela Gothic One',
    loadSystemFonts: false,
  },
  fitTo: { mode: 'width', value: 1024 },
})

const pngData = resvg.render().asPng()

await Promise.all([
  // PWA manifest icons (icons/)
  ...webpSizes.map((size) =>
    sharp(pngData)
      .resize(size, size)
      .webp({ quality: 90 })
      .toFile(resolve(root, `icons/icon-${size}.webp`))
  ),

  // Play Store listing icon (icons/)
  sharp(pngData)
    .resize(512, 512)
    .png()
    .toFile(resolve(root, 'icons/icon-512.png')),

  // @capacitor/assets input — full icon (assets/)
  sharp(pngData)
    .resize(1024, 1024)
    .png()
    .toFile(resolve(root, 'assets/icon-only.png')),

  // @capacitor/assets input — adaptive foreground (assets/)
  sharp(pngData)
    .resize(1024, 1024)
    .png()
    .toFile(resolve(root, 'assets/icon-foreground.png')),

  // @capacitor/assets input — adaptive background, solid #13121c (assets/)
  sharp({ create: { width: 1024, height: 1024, channels: 3, background: { r: 19, g: 18, b: 28 } } })
    .png()
    .toFile(resolve(root, 'assets/icon-background.png')),
])

console.log('Generated:')
console.log(`  icons/  → icon-512.png (Play Store), ${webpSizes.map((s) => `icon-${s}.webp`).join(', ')} (PWA)`)
console.log('  assets/ → icon-only.png, icon-foreground.png, icon-background.png (capacitor/assets input)')