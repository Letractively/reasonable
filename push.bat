@echo off
echo +-------------------+
echo ^| reasonable pusher ^|
echo +-------------------+
echo.
echo Determing which files were added and removed...
hg addremove
echo.
set /p message=Commit message: 
hg commit -m "%message%"
exit
hg push
ping -n 2 127.0.0.1>nul