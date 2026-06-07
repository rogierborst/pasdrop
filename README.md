## PassDrop

All your bar / qr code passes in one handy app.

---

### Local development

- Install the ionic cli: `npm install -g @ionic/cli`
- After running `npm install` you'll be able to preview your app in the browser by running `ionic serve`

---

### Device setup (required for all on-device workflows)

- Ensure `JAVA_HOME` is set and points to a JDK. If you have Android Studio installed, you can use its bundled JDK: `C:\Program Files\Android\Android Studio\jbr`
- Ensure `adb` is on your PATH. It lives in the Android SDK platform-tools directory, typically `C:\Users\<you>\AppData\Local\Android\Sdk\platform-tools`. Add it via System Environment Variables → Path.
- Enable **Developer options** on your Android device (tap *Build number* 7 times in Settings → About phone)
- Enable **USB debugging** in Developer options
- Connect your device via USB and accept the prompt on the device
- Run `adb devices` to confirm your device is listed

---

### Developing with live reload on device

- `npm run hot`
- Changes are reflected live on both your device and browser

---
### Installing a build via ADB

Use this to install an APK directly without going through the Play Store. Requires `JAVA_HOME` to be set (see device setup above).

- `npm run deploy`
- If multiple devices are connected, target a specific one by running the steps manually:
  ```powershell
  ionic build
  npx cap sync android
  cd android
  .\gradlew.bat assembleDebug
  adb -s <device-id> install app/build/outputs/apk/debug/app-debug.apk
  ```

---

### Release signing setup (required on every machine that builds a release)

Release builds require two things that live outside the repository:

**1. Keystore file**

Copy `passdrop-release.jks` to `~/keystores/passdrop-release.jks` on the machine.
The file is not in the repo — get it from your USB backup or secure storage.

**2. Gradle credentials**

Create or open `~/.gradle/gradle.properties` (`C:\Users\<you>\.gradle\gradle.properties` on Windows) and add:

```properties
PASSDROP_PASSWORD=your_password
```

This password is fixed — it is baked into `passdrop-release.jks` and must be the same on every machine. Get it from your password manager. This gradle.properties file is global to Gradle on your machine and is never committed to git.

Once both are in place, release builds work via Android Studio (**Build → Generate Signed Bundle / APK**) or CLI:

```powershell
cd android
.\gradlew.bat bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

---

### Releasing a new version to the Play Store

#### 1. Increment the version

Open `android/app/build.gradle` and update both fields in `defaultConfig`:

```groovy
versionCode 2          // must be higher than the previous release — Play Store rejects downgrades
versionName "1.1.0"    // human-readable, shown in the store listing
```

- `versionCode` — an integer, increment by at least 1 each release.
- `versionName` — follow [semver](https://semver.org/): `MAJOR.MINOR.PATCH`.

#### 2. Build the signed release bundle

```powershell
npm run build
npx cap sync android
cd android
.\gradlew.bat bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

Requires the keystore and `PASSDROP_PASSWORD` to be in place — see *Release signing setup* above.

#### 3. Upload to the Play Console

1. Go to [play.google.com/console](https://play.google.com/console) and open the **PasDrop** app.
2. Navigate to **Production → Create new release** (or **Internal testing** if you want to test first).
3. Upload `app-release.aab`.
4. Write release notes (what changed in this version).
5. Click **Review release**, resolve any warnings, then **Start rollout**.

Google typically reviews updates within a few hours to 1 day.

