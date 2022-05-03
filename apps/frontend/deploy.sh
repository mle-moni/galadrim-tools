#!/bin/sh

BUILD_PATH="../../dist/apps/frontend"
DEPLOY_PATH="/var/www/galadrim-rooms"

stat $BUILD_PATH &> /dev/null  || (echo "frontend should be built before" && exit 1) &&
rm -rf $DEPLOY_PATH || echo -n &&
cp -r $BUILD_PATH $DEPLOY_PATH
