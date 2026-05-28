# Publishing to Google Play Store

## 1. Google Play Developer account

- Sign up at [play.google.com/console](https://play.google.com/console) — one-time $25 registration fee
- Complete identity verification (can take a day or two)

## 2. Prepare the app

**App ID** — confirm `appId` in `capacitor.config.ts` is a unique reverse-domain identifier (e.g. `com.yourname.passDrop`). This can never be changed after publishing.

**Version** — set `versionCode` (integer, increment each release) and `versionName` (human-readable) in `android/app/build.gradle`.

## 3. Generate a signing keystore

```powershell
keytool -genkeypair -v -keystore passDrop-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias passDrop
```

Store this file somewhere safe and **back it up** — if you lose it, you can never update the app.

Configure signing in `android/app/build.gradle` under `android > signingConfigs`.

## 4. Build a release AAB (App Bundle)

```powershell
ionic build
npx cap sync android
cd android
.\gradlew.bat bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## 5. Create the app in Play Console

- New app → fill in name, default language, app/game, free/paid
- Complete the **store listing**: description, screenshots (phone + tablet), icon (512×512 PNG), feature graphic (1024×500)
- Fill in the **content rating** questionnaire
- Add a **privacy policy URL** (required — even if the app stores no user data, Google requires one)
- Set up **app pricing & distribution**

## 6. Upload and release

- Go to **Production** (or start with **Internal testing** to test with a small group first)
- Create a new release, upload the `.aab`
- Write release notes
- Roll out → submit for review

## 7. Review

First submission typically takes 1–7 days. Subsequent updates are usually faster.
