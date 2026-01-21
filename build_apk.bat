@echo off
echo.
echo Building Secure Camera App APK...
echo.

REM Navigate to the flutter app directory
cd /d "%~dp0flutter\cameraapp"

if %ERRORLEVEL% NEQ 0 (
    echo Error: Cannot access the Flutter project directory
    echo Please make sure you're running this from the project root
    pause
    exit /b 1
)

echo Checking prerequisites...
flutter doctor -v
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Flutter doctor reported issues, continuing anyway...
)

echo Cleaning previous builds...
flutter clean

echo Getting dependencies...
flutter pub get

echo Building APK...
flutter build apk --release

echo.
echo Build process completed!
echo Check the output above for any errors.
echo APK should be located in build\app\outputs\flutter-apk\ if successful.
echo.
pause