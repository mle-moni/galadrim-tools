#!/bin/sh

BUILD_PATH="../../dist/apps/frontend"
DEPLOY_PATH="/var/www/galadrim-tools"

stat $BUILD_PATH &> /dev/null  || (echo "frontend should be built before" && exit 1) &&
sudo rm -rf $DEPLOY_PATH || echo -n &&
sudo cp -r $BUILD_PATH $DEPLOY_PATH
