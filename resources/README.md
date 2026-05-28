# resources/

Source files for the app icon and splash screen. These are the files you edit.
Everything else is generated from these — never edit generated files directly.

| File | Purpose |
|---|---|
| `icon.svg` | Master icon source (vector). Edit this to change the icon. |
| `DelaGothicOne-Regular.ttf` | Font used in `icon.svg`, loaded locally by the generation script. |
| `splash.png` | Splash screen source image (2732×2732 recommended). |

## Regenerating icons

```bash
npm run icons:render   # regenerates icons/ and assets/ from icon.svg
npm run icons:sync     # icons:render + stamps Android mipmap files via @capacitor/assets
```