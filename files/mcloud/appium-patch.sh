# patched both sources in lib and compiled in build/lib for easier maintenance in future
cp ${APPIUM_HOME}/node_modules/appium-base-driver/lib/basedriver/helpers.js ${APPIUM_HOME}/node_modules/appium-base-driver/lib/basedriver/helpers.js.bak
cp /opt/mcloud/appium-base-driver/lib/basedriver/helpers.js ${APPIUM_HOME}/node_modules/appium-base-driver/lib/basedriver/helpers.js

cp ${APPIUM_HOME}/node_modules/appium-base-driver/lib/basedriver/driver.js ${APPIUM_HOME}/node_modules/appium-base-driver/lib/basedriver/driver.js.bak
#cp /opt/mcloud/appium-base-driver/lib/basedriver/driver.js ${APPIUM_HOME}/node_modules/appium-base-driver/lib/basedriver/driver.js

cp ${APPIUM_HOME}/node_modules/appium-base-driver/lib/basedriver/commands/session.js ${APPIUM_HOME}/node_modules/appium-base-driver/lib/basedriver/commands/session.js.bak
#cp /opt/mcloud/appium-base-driver/lib/basedriver/session.js ${APPIUM_HOME}/node_modules/appium-base-driver/lib/basedriver/commands/session.js

cp ${APPIUM_HOME}/node_modules/appium-base-driver/build/lib/basedriver/helpers.js ${APPIUM_HOME}/node_modules/appium-base-driver/build/lib/basedriver/helpers.js.bak
cp /opt/mcloud/appium-base-driver/build/lib/basedriver/helpers.js ${APPIUM_HOME}/node_modules/appium-base-driver/build/lib/basedriver/helpers.js

cp ${APPIUM_HOME}/node_modules/appium-base-driver/build/lib/basedriver/driver.js ${APPIUM_HOME}/node_modules/appium-base-driver/build/lib/basedriver/driver.js.bak
cp /opt/mcloud/appium-base-driver/build/lib/basedriver/driver.js ${APPIUM_HOME}/node_modules/appium-base-driver/build/lib/basedriver/driver.js

cp ${APPIUM_HOME}/node_modules/appium-base-driver/build/lib/basedriver/commands/session.js ${APPIUM_HOME}/node_modules/appium-base-driver/build/lib/basedriver/commands/session.js.bak
cp /opt/mcloud/appium-base-driver/build/lib/basedriver/session.js ${APPIUM_HOME}/node_modules/appium-base-driver/build/lib/basedriver/commands/session.js

# PATCH <appium>/node_modules/appium/node_modules/appium-base-driver/build/lib/protocol/protocol.js to return to carina "DEBUG info" about problematic step
cp ${APPIUM_HOME}/node_modules/appium-base-driver/build/lib/protocol/protocol.js ${APPIUM_HOME}/node_modules/appium-base-driver/build/lib/protocol/protocol.js.bak
cp /opt/mcloud/appium-base-driver/build/lib/protocol/protocol.js ${APPIUM_HOME}/node_modules/appium-base-driver/build/lib/protocol/protocol.js

cp /opt/mcloud/appium-base-driver/lib/basedriver/mcloud-utils.js ${APPIUM_HOME}/node_modules/appium-base-driver/lib/basedriver/mcloud-utils.js
cp /opt/mcloud/appium-base-driver/build/lib/basedriver/mcloud-utils.js ${APPIUM_HOME}/node_modules/appium-base-driver/build/lib/basedriver/mcloud-utils.js

# wda build/lib files
cp ${APPIUM_HOME}/node_modules/appium-xcuitest-driver/build/lib/ios-deploy.js ${APPIUM_HOME}/node_modules/appium-xcuitest-driver/build/lib/ios-deploy.js.bak
cp /opt/mcloud/appium-xcuitest-driver/build/lib/ios-deploy.js ${APPIUM_HOME}/node_modules/appium-xcuitest-driver/build/lib/ios-deploy.js
