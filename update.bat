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
cd ../
echo.
echo Deleting old archive...
del reasonable.zip
echo Creating new archive...
7za a reasonable.zip reasonable
echo.
echo Done!
ping -n 2 127.0.0.1>nul