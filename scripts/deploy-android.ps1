$ErrorActionPreference = 'Stop'

ionic build
npx cap sync android

Push-Location android
try {
    .\gradlew.bat assembleDebug
} finally {
    Pop-Location
}

adb install android/app/build/outputs/apk/debug/app-debug.apk
