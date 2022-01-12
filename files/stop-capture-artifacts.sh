#!/bin/bash
APPIUM_LOG="${APPIUM_LOG:-/var/log/appium.log}"

sessionId=$1

if [ ! -z $sessionId ]; then
  # save existing appium log file by as sessionId.log
  cp "${APPIUM_LOG}" "$sessionId.log"
fi


if [[ "${PLATFORM_NAME,,}" == "android" ]]; then
  # do not kill start-capture-artifacts.sh parent process!
  #pkill -e -f /opt/start-capture-artifacts.sh
  pkill -e -f screenrecord
fi

if [[ "${PLATFORM_NAME,,}" == "ios" ]]; then
  pkill -e -f ffmpeg
fi


exit 0

