#!/bin/sh

BUILD_PATH="../../dist/apps/backend"
PM2_NAME="galadrim-tools"

stat $BUILD_PATH &> /dev/null  || (echo "backend should be built before" && exit 1) &&
cd $BUILD_PATH &&
pm2 show $PM2_NAME | grep online || pm2 stop $PM2_NAME &&
pm2 start server.js --name $PM2_NAME
