#!/bin/sh

BUILD_PATH="../../dist/apps/backend"


stat $BUILD_PATH/../../libs/shared &> /dev/null  || (echo "shared library should be built before" && exit 1)
mv $BUILD_PATH/apps/backend/* $BUILD_PATH &&
rmdir $BUILD_PATH/apps/backend &&
rmdir $BUILD_PATH/apps &&
cp .env $BUILD_PATH &&
cd $BUILD_PATH &&
mkdir -p node_modules/@galadrim-tools &&
cd node_modules/@galadrim-tools &&
ln -s ../../../../libs/shared shared
