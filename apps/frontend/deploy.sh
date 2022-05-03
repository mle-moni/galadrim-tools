#!/bin/sh

BUILD_PATH="../../dist/apps/frontend"

stat $BUILD_PATH &> /dev/null  || (echo "frontend should be built before" && exit 1) &&
cp -r $BUILD_PATH /var/www/galadrim-rooms
