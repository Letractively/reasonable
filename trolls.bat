@echo off
echo +---------------------+
echo ^| reasonable uploader ^|
echo +---------------------+
echo.
echo Copying trolls to local directory...
cd trolls
copy "trolls.json" "../../../site/public_html/reasonable/trolls.json"
echo.
echo Copying trolls to remote directory...
ftp -s:info.scr ftp.brymck.com
echo.
echo Done!
ping -n 2 127.0.0.1>nul