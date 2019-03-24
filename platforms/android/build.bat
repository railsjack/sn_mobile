del /S /Q assets\www
rd /S /Q assets\www
mkdir assets\www
del /Q ..\..\www\SafetyNotice-v0.0.3.apk
del /S /Q build\outputs\apk\*.*
xcopy ..\..\www assets\www /s /e
call .\gradlew.bat build -x lint -x lintVitalRelease
copy .\build\outputs\apk\android-release-unsigned.apk .\build\outputs\apk\SafetyNotice-v0.0.3.apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore .\build\keys\safetynotice.keystore .\build\outputs\apk\SafetyNotice-v0.0.3.apk safetynotice_alias
jarsigner -verify -verbose -certs .\build\outputs\apk\SafetyNotice-v0.0.3.apk
copy .\build\outputs\apk\SafetyNotice-v0.0.3.apk ..\..\www
copy .\build\outputs\apk\SafetyNotice-v0.0.3.apk ..\..\..\sn_site\public
set ORIGIN_WORK_DIR=%CD%
cd ..\..\..\sn_site
git pull
git add .
git commit -m "Added a compiled APK"
git push
cd %ORIGIN_WORK_DIR%
