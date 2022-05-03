#!/bin/sh

PM2_NAME="galadrim-rooms"

git pull &&
yarn install &&
nx build frontend &&
nx build backend &&
pm2 show $PM2_NAME | grep online && pm2 stop $PM2_NAME || echo -n
nx migrate-prod backend &&
nx deploy backend &&
nx deploy frontend &&
echo "Deployment success"
