import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = resolve(root, 'resources/icon.svg')
const notificationSvgPath = resolve(root, 'resources/icon-notification.svg')
const fontPath = resolve(root, 'resources/DelaGothicOne-Regular.ttf')

const webpSizes = [48, 72, 96, 128, 192, 256, 512]

// Android status bar/notification icon: alpha-only silhouette, stamped per density bucket.
const notificationIconDensities = {
  'drawable-mdpi': 24,
  'drawable-hdpi': 36,
  'drawable-xhdpi': 48,
  'drawable-xxhdpi': 72,
  'drawable-xxxhdpi': 96,
}

const fontOptions = {
  font: {
    fontFiles: [fontPath],
    defaultFontFamily: 'Dela Gothic One',
    loadSystemFonts: false,
  },
}

const svg = readFileSync(svgPath, 'utf-8')
const resvg = new Resvg(svg, {
  ...fontOptions,
  fitTo: { mode: 'width', value: 1024 },
})

const pngData = resvg.render().asPng()

const notificationSvg = readFileSync(notificationSvgPath, 'utf-8')
const notificationPngData = new Resvg(notificationSvg, {
  ...fontOptions,
  fitTo: { mode: 'width', value: 1024 },
}).render().asPng()

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

  // Android status bar/notification icon, one per density bucket
  ...Object.entries(notificationIconDensities).map(([dir, size]) => {
    mkdirSync(resolve(root, `android/app/src/main/res/${dir}`), { recursive: true })
    return sharp(notificationPngData)
      .resize(size, size)
      .png()
      .toFile(resolve(root, `android/app/src/main/res/${dir}/ic_stat_notify.png`))
  }),
])

console.log('Generated:')
console.log(`  icons/  → icon-512.png (Play Store), ${webpSizes.map((s) => `icon-${s}.webp`).join(', ')} (PWA)`)
console.log('  assets/ → icon-only.png, icon-foreground.png, icon-background.png (capacitor/assets input)')
console.log(`  android/app/src/main/res/drawable-*/ → ic_stat_notify.png (${Object.values(notificationIconDensities).join(', ')})`)