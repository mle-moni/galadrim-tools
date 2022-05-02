#!/bin/sh

BUILD_PATH="../../dist/apps/backend"

mv $BUILD_PATH/apps/backend/* $BUILD_PATH &&
rmdir $BUILD_PATH/apps/backend &&
rmdir $BUILD_PATH/apps &&
cp .env $BUILD_PATH
