#!/bin/bash
# deploy.sh - Auto update, build and restart

APP_DIR="./"   # change to your project path
APP_NAME="puffly"           # name of your pm2 process

echo "---- Pulling latest code ----"
cd $APP_DIR || exit
git reset --hard
git pull origin main  # or your branch name

echo "---- Installing dependencies ----"
npm install

echo "---- Building project ----"
npm run build

echo "---- Restarting PM2 ----"
pm2 restart $APP_NAME || pm2 start "npm start" --name $APP_NAME -- run start

echo "---- Deployment finished ----"
