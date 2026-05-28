# resources/

Source files for the app icon and splash screen. These are the files you edit.
Everything else is generated from these — never edit generated files directly.

| File | Purpose |
|---|---|
| `icon.svg` | Master icon source (vector). Edit this to change the icon. |
| `feature-graphic.svg` | Play Store feature graphic source (1024×500). Edit this to change the banner. The app icon is composited on top at render time — the dashed placeholder shows where it lands. |
| `DelaGothicOne-Regular.ttf` | Font used in `icon.svg` and `feature-graphic.svg`, loaded locally by the generation scripts. |

## Regenerating icons

```bash
npm run icons:render   # regenerates icons/ and assets/ from icon.svg
npm run icons:sync     # icons:render + stamps Android mipmap files via @capacitor/assets
```