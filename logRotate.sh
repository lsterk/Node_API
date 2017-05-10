#!/bin/bash
# logRotate.sh dumps all old logs, and archives current logs

cd /var/log/kiosk
for file in ./*
do
  echo $file
done
# delete old files
rm *.old

for file in ./*.log
do
  # rename the current log files as log_file_name.old
  echo Copying $file to $file.old
  # NOTE: NEED to change 'cp' to 'mv', otherwise old logs don't actually rotate
  cp $file $file.old
  # create a new file after renaming the current one to .old
  touch $file
done

# done
echo Done rotating logs
ls
