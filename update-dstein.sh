#!/bin/bash
# script to pull p5widget from github and install it
#

PROJECT_DIR="p5widget";

### Check if we are on my mac ###
if [ -d "/Users/davidstein" ] 
then
    echo "Do not run update on your Mac... update.sh meant for deployment only on Linux" 
    exit 9999 # die with error code 9999
fi

var=$(date +"%s")

git pull

npm install
npm test

if [ -n "${DEPLOY_DIR}" ]; then
  echo "Installing at $DEPLOY_DIR$PROJECT_DIR";
  cp -rf css "$DEPLOY_DIR$PROJECT_DIR"
  cp -rf static "$DEPLOY_DIR$PROJECT_DIR"
  cp -f p5-widget.js* "$DEPLOY_DIR$PROJECT_DIR"
  cp -f p5-widget.html "$DEPLOY_DIR$PROJECT_DIR"
  cp main.bundle.* "$DEPLOY_DIR$PROJECT_DIR"
  cp preview-frame.* "$DEPLOY_DIR$PROJECT_DIR"

else
  echo "Deploy Directory Environment Variable is not set";
  echo "Add the following line to .bashrc file";
  echo "export DEPLOY_DIR=\"/var/www/html/\""
fi

