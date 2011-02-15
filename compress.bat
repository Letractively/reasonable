@echo off
echo +-----------------------+
echo ^| reasonable compresser ^|
echo +-----------------------+
echo.
echo Deleting old archive...
del reasonable.zip
echo Creating new archive...
7z a reasonable.zip reasonable
echo.
echo Done!
ping -n 2 127.0.0.1>nul