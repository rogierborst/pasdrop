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

### Previewing on device

- `ionic build`
- `npx cap sync android`
- Open Android Studio, select your device, and hit the **Run App** icon in the top bar

---

### Developing with live reload on device

- `ionic cap run android -l --external`
- Changes are reflected live on both your device and browser

---

### Installing a build via ADB

Use this to install an APK directly without going through the Play Store. Requires `JAVA_HOME` to be set (see live reload section below).

- Build the web app, sync, and build the APK:
  ```powershell
  ionic build
  npx cap sync android
  cd android
  .\gradlew.bat assembleDebug
  ```
  Output: `android/app/build/outputs/apk/debug/app-debug.apk`
- Install:
  ```powershell
  adb install app/build/outputs/apk/debug/app-debug.apk
  ```
- If multiple devices are connected, target a specific one:
  ```powershell
  adb -s <device-id> install app/build/outputs/apk/debug/app-debug.apk
  ```
