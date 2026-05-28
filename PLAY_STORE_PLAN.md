# PasDrop — Google Play Store Release Plan

## Overview

Steps to publish PasD'rop to the Google Play Store as a free app.
Work through these phases in order — each phase has blockers for the next.

---

## ✅ Phase 1 — Google Play Developer Account

1. Go to [play.google.com/console](https://play.google.com/console) and sign in with your Google account.
2. Pay the one-time **$25 registration fee**.
3. Fill in your developer profile (name, email, phone number).
4. Wait for account approval — usually instant, but can take up to 48 hours.

---

## ✅ Phase 2 — App Identity

Application ID: `nl.rogierborst.pasdrop` (permanent — cannot be changed after publishing).

Changes made:
- `android/app/build.gradle` — `namespace` and `applicationId` updated, `minifyEnabled true`, signing config added
- `capacitor.config.ts` — `appId` set to `nl.rogierborst.pasdrop`
- `android/app/src/main/java/nl/rogierborst/pasdrop/MainActivity.java` — created at new package path
- `versionCode 1`, `versionName "1.0.0"`

---

## ✅ Phase 3 — Privacy Policy

Privacy policy written and hosted via GitHub Pages at:
`https://rogierborst.github.io/pasdrop/privacy.html`

Source: `docs/privacy.html` in this repo (branch `to-play-store`).

> **After merging `to-play-store` into `main`**: go to repo **Settings → Pages** and switch the source branch to `main`.

---

## ✅ Phase 4 — Signing Keystore

Keystore file: `~/keystores/passdrop-release.jks`
- Backed up to USB drive
- Alias: `passdrop`
- Password stored in password manager and in `~/.gradle/gradle.properties` as `PASSDROP_PASSWORD`

`build.gradle` signing config:
```groovy
signingConfigs {
    release {
        storeFile file("${System.getProperty('user.home')}/keystores/passdrop-release.jks")
        storePassword PASSDROP_PASSWORD
        keyAlias "passdrop"
        keyPassword PASSDROP_PASSWORD
    }
}
```

See `README.md` for instructions on setting this up on a new machine.

---

## ✅ Phase 5 — Store Assets

### App icon — done
Generated via `npm run gen:icons`. Output: `icons/icon-512.png` (512×512 PNG).

### Feature graphic — done
Generated via `npm run gen:feature`. Output: `icons/feature-graphic.png` (1024×500 PNG).
To adjust the design, edit `resources/feature-graphic.svg` and re-run the script.

### Screenshots — done

Google Play requires at least **2 phone screenshots**.
Recommended: 4–6 screenshots showing key features.

- Minimum size: 320px on shortest side, 3840px on longest side
- Aspect ratio: between 16:9 and 9:16
- Format: PNG or JPEG

**How to take them:**
1. Open the app on your device (light or dark mode — be consistent).
2. Capture these screens: pass list, pass detail/viewer, add pass, scanner.
3. Key combo on Samsung: **Power + Volume Down**.
4. Transfer from `This PC → [phone] → Internal shared storage → Pictures → Screenshots`.
5. Drop the files into `screenshots/` and run:
   ```powershell
   npm run screenshots:process
   ```
6. Upload the cropped versions from `screenshots/processed/` to the Play Console.

See `screenshots/README.md` for more details.

---

## ✅ Phase 6 — Build the Release AAB

Google Play prefers **Android App Bundles (.aab)** over APKs.

```powershell
npm run build
npx cap sync android
```

In Android Studio:
1. **Build → Generate Signed Bundle / APK**
2. Choose **Android App Bundle**
3. Select your keystore (`~/keystores/passdrop-release.jks`), enter password
4. Choose **release** build variant
5. Output: `android/app/release/app-release.aab`

Or via CLI:
```powershell
cd android
.\gradlew.bat bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

> **Note:** If R8 minification fails with a missing Gson class error, add `-dontwarn com.google.gson.annotations.SerializedName` to `android/app/proguard-rules.pro`. This is already in place.

---

## ✅ Phase 7 — Play Console Setup

### Create the app

1. In Play Console: **All apps → Create app**
2. App name: `Pasdrop`
3. Default language: Dutch (`nl`) — or your preference
4. App or game: **App**
5. Free or paid: **Free**
6. Accept the declarations and create.

### Fill in the store listing

Under **Store presence → Main store listing**:

| Field | Value |
|---|---|
| App name | PasDrop |
| Short description | Manage and display your barcodes & QR codes in one place (max 80 chars) |
| Full description | (See draft below) |
| App icon | `icons/icon-512.png` |
| Feature graphic | `icons/feature-graphic.png` |
| Phone screenshots | At least 2, up to 8 |

**Draft full description:**
```
PasDrop is a simple, private pass manager for your barcodes and QR codes.

Store loyalty cards, event tickets, boarding passes, or any barcode you use regularly. PasDrop keeps everything organised and ready to scan at the checkout — no internet required.

Features:
• Scan barcodes and QR codes with your camera
• Store passes with custom labels and colours
• View full-screen for easy scanning
• Set expiry dates so outdated passes don't clutter your list
• All data stays on your device — nothing is uploaded anywhere

No account. No ads. No tracking.
```

### Content rating

Under **Policy → App content → Content rating**:
- Complete the IARC questionnaire
- PasDrop should receive a **Everyone** (E) rating

### Target audience

Under **Policy → App content → Target audience**:
- Select **18+** or **All ages** depending on your preference
- If "All ages": confirm the app does not collect data from children

### Privacy policy

Under **Policy → App content → Privacy policy**:
- URL: `https://rogierborst.github.io/pass-drop/privacy.html`

---

## Phase 8 — Release

### Internal testing (recommended first step)

1. **Testing → Internal testing → Create new release**
2. Upload your `.aab`
3. Add your own Google account as a tester
4. Install via the Play Store to verify it works correctly on a real device

### Production release

Once internal testing looks good:
1. **Production → Create new release**
2. Upload the same `.aab`
3. Write release notes (what's new)
4. **Review release** — Play Console will flag any policy issues
5. **Start rollout** — choose 100% or a staged percentage

Google typically reviews new apps within **1–3 days** before they go live.

---

## Checklist Summary

- [x] Phase 1 — Google Play Developer account created and approved
- [x] Phase 2 — App ID set to `nl.rogierborst.pasdrop`
- [x] Phase 2 — `capacitor.config.ts` updated with real appId and appName
- [x] Phase 2 — `MainActivity.java` moved to new package path
- [x] Phase 3 — Privacy policy written and hosted at `https://rogierborst.github.io/pass-drop/privacy.html`
- [x] Phase 4 — Release keystore generated and backed up securely
- [x] Phase 4 — `build.gradle` signing config set up
- [x] Phase 5 — 512×512 app icon PNG ready (`icons/icon-512.png`)
- [x] Phase 5 — 1024×500 feature graphic ready (`icons/feature-graphic.png`)
- [ ] Phase 5 — At least 4 phone screenshots taken
- [x] Phase 6 — Release `.aab` built and verified
- [x] Phase 7 — Store listing complete (description, assets, ratings, privacy policy)
- [ ] Phase 8 — Internal test release installed and verified on device
- [ ] Phase 8 — Production release submitted

---

## Notes

- Every update you upload must have a higher `versionCode` than the previous one.
- Keep your keystore and password safe — losing them means you cannot update the app and would have to publish under a new ID.
- The camera permission (`CAMERA`) is declared in `AndroidManifest.xml` — it will be shown to users before install.
- **After merging `to-play-store` into `main`**: go to repo **Settings → Pages** and switch the GitHub Pages source branch from `to-play-store` to `main`, so the privacy policy page keeps working.