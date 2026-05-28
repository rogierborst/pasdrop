import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = resolve(root, 'resources/feature-graphic.svg')
const fontPath = resolve(root, 'resources/DelaGothicOne-Regular.ttf')
const iconPath = resolve(root, 'icons/icon-512.png')

const W = 1024
const H = 500
const ICON_SIZE = 300
const ICON_LEFT = 700
const ICON_TOP = Math.round((H - ICON_SIZE) / 2)

const svg = readFileSync(svgPath, 'utf-8')

const resvg = new Resvg(svg, {
  font: {
    fontFiles: [fontPath],
    defaultFontFamily: 'Dela Gothic One',
    loadSystemFonts: false,
  },
  fitTo: { mode: 'width', value: W },
})

const bgPng = resvg.render().asPng()

const iconBuffer = await sharp(iconPath)
  .resize(ICON_SIZE, ICON_SIZE)
  .toBuffer()

await sharp(bgPng)
  .composite([{ input: iconBuffer, left: ICON_LEFT, top: ICON_TOP }])
  .png()
  .toFile(resolve(root, 'icons/feature-graphic.png'))

console.log(`Generated icons/feature-graphic.png (${W}×${H})`)