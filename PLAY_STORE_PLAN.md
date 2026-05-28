# PassDrop — Google Play Store Release Plan

## Overview

Steps to publish PassDrop to the Google Play Store as a free app.
Work through these phases in order — each phase has blockers for the next.

---

## Phase 1 — Google Play Developer Account

1. Go to [play.google.com/console](https://play.google.com/console) and sign in with your Google account.
2. Pay the one-time **$25 registration fee**.
3. Fill in your developer profile (name, email, phone number).
4. Wait for account approval — usually instant, but can take up to 48 hours.

---

## Phase 2 — App Identity (Code Changes)

The app still uses the Ionic starter ID and needs a real identity before publishing.
**These changes must be made before building the release APK/AAB.**

### 2a. Choose your Application ID

Pick a reverse-domain identifier you own. Example: `com.passdrop.app`
This ID is **permanent** once published — you cannot change it.

### 2b. Update `android/app/build.gradle`

```groovy
// Change these two lines:
namespace "com.passdrop.app"        // was: io.ionic.starter
applicationId "com.passdrop.app"   // was: io.ionic.starter
```

Set the initial version:
```groovy
versionCode 1       // increment by 1 with every upload to Play
versionName "1.0.0" // human-readable version shown to users
```

Enable minification for release builds (reduces APK size):
```groovy
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 2c. Update `capacitor.config.ts` / `capacitor.config.json`

Set the `appId` and `appName`:
```json
{
  "appId": "com.passdrop.app",
  "appName": "PassDrop"
}
```

### 2d. Sync Capacitor

```bash
npm run build
npx cap sync android
```

---

## Phase 3 — Privacy Policy

Google Play requires a privacy policy if your app collects or stores any user data.
PassDrop stores pass data locally — a simple policy is sufficient.

1. Write a plain-language privacy policy. Key points to cover:
   - What data is stored (pass labels, barcodes, colors) — **locally on device only**
   - No data is sent to servers
   - No third-party analytics or advertising
   - How users can delete their data (delete passes in-app, or uninstall)
   - Contact email for privacy questions: `rogierborst@gmail.com`

2. Host it somewhere publicly accessible. Free options:
   - **GitHub Pages** — create a repo `passdrop-privacy` with an `index.html`
   - **Google Sites** — free, no custom domain needed
   - A page on your own website if you have one

3. Note the URL — you will need it in Phase 5.

---

## Phase 4 — Signing Keystore

Android requires apps to be signed. **Never lose this keystore file** — you need it for every future update.

### Generate the keystore (run once)

```bash
keytool -genkey -v \
  -keystore passdrop-release.jks \
  -alias passdrop \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You will be prompted for a keystore password, your name, organisation, city, country.

Store `passdrop-release.jks` somewhere **outside the project directory** (e.g., `~/keystores/`).
Do **not** commit this file to git.

### Configure signing in `android/app/build.gradle`

Add a `signingConfigs` block and reference it in `buildTypes`:

```groovy
android {
    signingConfigs {
        release {
            storeFile file("/path/to/passdrop-release.jks")
            storePassword "YOUR_STORE_PASSWORD"
            keyAlias "passdrop"
            keyPassword "YOUR_KEY_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

> **Tip:** Move passwords to `~/.gradle/gradle.properties` instead of hardcoding them, then reference them as `PASSDROP_STORE_PASSWORD` etc. This keeps secrets out of build files.

---

## Phase 5 — Store Assets

### Already have: App icon

Make sure you have a **512×512 PNG** version for the Play Store listing (separate from the launcher icon).

### Still needed: Feature Graphic

- Size: **1024×500 px** PNG or JPEG
- Required to appear on your store listing page
- Should show the app name and a visual impression of the app
- Tools: Figma (free), Canva, or any image editor

### Still needed: Screenshots

Google Play requires at least **2 phone screenshots**.
Recommended: 4–6 screenshots showing key features.

- Minimum size: 320px on shortest side, 3840px on longest side
- Aspect ratio: between 16:9 and 9:16
- Formats: PNG or JPEG

**How to take them:**
1. Run the app on a real device or emulator.
2. Show these screens: pass list, pass detail/viewer, add pass, scanner.
3. Use Android's screenshot shortcut or `adb shell screencap`.

---

## Phase 6 — Build the Release AAB

Google Play prefers **Android App Bundles (.aab)** over APKs.

```bash
# Build the web assets first
npm run build

# Sync to Android
npx cap sync android

# Open Android Studio (or build from CLI)
npx cap open android
```

In Android Studio:
1. **Build → Generate Signed Bundle / APK**
2. Choose **Android App Bundle**
3. Select your keystore, enter passwords
4. Choose **release** build variant
5. Output: `android/app/release/app-release.aab`

Or via CLI:
```bash
cd android
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

---

## Phase 7 — Play Console Setup

### Create the app

1. In Play Console: **All apps → Create app**
2. App name: `PassDrop`
3. Default language: your choice (e.g. English)
4. App or game: **App**
5. Free or paid: **Free**
6. Accept the declarations and create.

### Fill in the store listing

Under **Store presence → Main store listing**:

| Field | Value |
|---|---|
| App name | PassDrop |
| Short description | Manage and display your barcodes & QR codes in one place (max 80 chars) |
| Full description | (See draft below) |
| App icon | 512×512 PNG |
| Feature graphic | 1024×500 PNG/JPG |
| Phone screenshots | At least 2, up to 8 |

**Draft full description:**
```
PassDrop is a simple, private pass manager for your barcodes and QR codes.

Store loyalty cards, event tickets, boarding passes, or any barcode you use regularly. PassDrop keeps everything organised and ready to scan at the checkout — no internet required.

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
- PassDrop should receive a **Everyone** (E) rating

### Target audience

Under **Policy → App content → Target audience**:
- Select **18+** or **All ages** depending on your preference
- If "All ages": confirm the app does not collect data from children

### Privacy policy

Under **Policy → App content → Privacy policy**:
- Enter the URL you set up in Phase 3

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

- [ ] Phase 1 — Google Play Developer account created and approved
- [ ] Phase 2 — App ID changed from `io.ionic.starter` to `com.passdrop.app` (or chosen ID)
- [ ] Phase 2 — `capacitor.config` updated with real appId and appName
- [ ] Phase 3 — Privacy policy written and hosted at a public URL
- [ ] Phase 4 — Release keystore generated and backed up securely
- [ ] Phase 4 — `build.gradle` signing config set up
- [ ] Phase 5 — 512×512 app icon PNG ready
- [ ] Phase 5 — 1024×500 feature graphic created
- [ ] Phase 5 — At least 4 phone screenshots taken
- [ ] Phase 6 — Release `.aab` built and verified
- [ ] Phase 7 — Store listing complete (description, assets, ratings, privacy policy)
- [ ] Phase 8 — Internal test release installed and verified on device
- [ ] Phase 8 — Production release submitted

---

## Notes

- The `applicationId` you choose in Phase 2 is **permanent**. Pick carefully.
- Keep your keystore file and passwords somewhere safe (password manager, separate backup). Losing it means you cannot update the app — you would have to publish under a new ID.
- Every update you upload must have a higher `versionCode` than the previous one.
- If you add the camera permission for barcode scanning (`CAMERA`) in the manifest, it will be shown to users before install — make sure this is already declared.