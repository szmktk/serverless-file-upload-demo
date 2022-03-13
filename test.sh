#!/usr/bin/env bash

UPLOAD_URL=$(curl -s https://9bjjxa1xp9.execute-api.eu-west-1.amazonaws.com/ | jq -r '.uploadUrl')
FILE_PATH=$1

#curl -X PUT --data-binary "@/Users/$YOUR_USER/text-file.txt" $UPLOAD_URL
curl -X PUT --data-binary "@$FILE_PATH" $UPLOAD_URL

