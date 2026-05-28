import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = resolve(root, 'resources/icon.svg')
const fontPath = resolve(root, 'resources/DelaGothicOne-Regular.ttf')

const sizes = [48, 72, 96, 128, 192, 256, 512]

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
  ...sizes.map((size) =>
    sharp(pngData)
      .resize(size, size)
      .webp({ quality: 90 })
      .toFile(resolve(root, `icons/icon-${size}.webp`))
  ),
  sharp(pngData)
    .resize(512, 512)
    .png()
    .toFile(resolve(root, 'icons/icon-512.png')),
  sharp(pngData)
    .resize(1024, 1024)
    .png()
    .toFile(resolve(root, 'resources/icon.png')),
])

console.log(`Generated ${sizes.map((s) => `icon-${s}.webp`).join(', ')}, icon-512.png in icons/, resources/icon.png`)
