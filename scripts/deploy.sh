source CONFIG

rsync -r --delete www/ $WEBSITE_DIR
curl -s $PUBLISH_URL > /dev/null
