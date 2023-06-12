# check for vars
if [ -z "$WEEBIFY_CREATE_BUCKET" ]; then
    exit 1
fi

sleep 5

echo "Weebify minio init script"

# set credentials
mc alias set s3 http://s3:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
sleep 1
# check if bucket exists
mc ls s3 --json | grep "\"key\":\"$WEEBIFY_CREATE_BUCKET\""
if [ $? -eq 0 ]; then
    echo "Bucket already exists"
    exit 0
fi

echo "Creating bucket"

# create bucket
mc mb s3/$WEEBIFY_CREATE_BUCKET

# set policy
mc anonymous set download s3/weebify
