# screenshots/

Play Store screenshots taken on a physical Android device.

Raw screenshots go in this folder. Processed (cropped) versions are written to
`screenshots/processed/` by the process script and are the files to upload to the Play Console.

## Taking screenshots

- **Key combo**: Power + Volume Down (Samsung)
- Transfer from device: `This PC → [phone] → Internal shared storage → Pictures → Screenshots`
- Aim for 4–6 screenshots covering: pass list, pass detail/viewer, add pass, scanner
- Use light or dark mode consistently across all screenshots

## Processing

The process script crops the status bar off the top of each screenshot:

```bash
npm run screenshots:process
```

Output lands in `screenshots/processed/`. If the crop cuts too much or too little, adjust `CROP_TOP` (status bar)
or `CROP_BOTTOM` (navigation bar) in `scripts/process-screenshots.mjs` and re-run.

## Requirements (Google Play)

- Minimum: 2 screenshots, maximum: 8
- Minimum size: 320px on shortest side, 3840px on longest side
- Aspect ratio: between 16:9 and 9:16
- Format: PNG or JPEG