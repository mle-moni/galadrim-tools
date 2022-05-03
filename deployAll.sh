#!/bin/sh

PM2_NAME="galadrim-rooms"

yarn install &&
nx test backend &&
nx test shared &&
nx build frontend &&
TIME_DOWN=`date +%s`
(pm2 show $PM2_NAME | grep online && pm2 stop $PM2_NAME || echo -n) &&
nx build backend &&
nx migrate-prod backend &&
nx deploy backend &&
nx deploy frontend &&
TIME_UP=`date +%s`
echo "Deployment success"
echo "down time -->" `expr $TIME_UP - $TIME_DOWN` seconds
