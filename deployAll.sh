#!/bin/sh

PM2_NAME="galadrim-tools"

# exit when any command fails
set -e

yarn
yarn test
yarn build:shared
yarn build:frontend
TIME_DOWN=`date +%s`
(pm2 show $PM2_NAME | grep online && pm2 stop $PM2_NAME || echo -n)
yarn build:backend
yarn migrate-prod
yarn deploy:backend
yarn deploy:frontend:nobuild
rm -f /home/ubuntu/galadrim-tools/apps/backend/build/tmp
ln -s /home/ubuntu/galadrim-tools/apps/backend/tmp /home/ubuntu/galadrim-tools/apps/backend/build/tmp
TIME_UP=`date +%s`

echo "Deployment success"
echo "down time -->" `expr $TIME_UP - $TIME_DOWN` seconds
