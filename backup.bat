@echo off

REM backup info https://blog.rudolphk.co.za/mongodb-backup-script-for-windows-using-a-batch-file-4d0964e696ff
REM run script on computer shutdown https://superuser.com/questions/773651/run-a-script-just-before-shutdown-or-reboot-on-windows-home-edition

set dropbox_path="E:\\borsch\\"

REM Create a file name for the database output which contains the date and time. Replace any characters which might cause an issue.
set filename=backup_date_%date%_time_%time%
set filename=%filename:/=-%
set filename=%filename: =%
set filename=%filename:.=-%
set filename=%filename::=-%
set filename=%dropbox_path%%filename%

REM Export the database
echo Running backup "%filename%"
mongodump --out %filename% --db commodity_circulation

REM ZIP the backup directory
echo Running backup "%filename%"
"c:\Program Files\7-Zip\7z.exe" a -tzip "%filename%.zip" "%filename%"

REM Delete the backup directory (leave the ZIP file). The /q tag makes sure we don't get prompted for questions 
echo Deleting original backup directory "%filename%"
rmdir "%filename%" /s /q

echo BACKUP COMPLETE