#!/bin/sh

PM2_NAME="galadrim-tools"

# exit when any command fails
set -e

corepack enable
corepack prepare pnpm@10.0.0 --activate

pnpm install --frozen-lockfile
pnpm test
pnpm build:shared
pnpm build:frontend
TIME_DOWN=`date +%s`
(pm2 show $PM2_NAME | grep online && pm2 stop $PM2_NAME || echo -n)
pnpm build:backend
pnpm migrate-prod
pnpm deploy:backend
pnpm deploy:frontend:nobuild
rm -f /home/ubuntu/galadrim-tools/apps/backend/build/tmp
ln -s /home/ubuntu/galadrim-tools/apps/backend/tmp /home/ubuntu/galadrim-tools/apps/backend/build/tmp
TIME_UP=`date +%s`

echo "Deployment success"
echo "down time -->" `expr $TIME_UP - $TIME_DOWN` seconds
