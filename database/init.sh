#!/bin/sh
# Wrapper around the entrypoint that creates a random keyfile so we can use replication

KEYFILE="/tmp/keyfile.key"

if [ ! -f "$KEYFILE" ]; then
    echo "Creating a keyfile..."
    openssl rand -base64 756 > "$KEYFILE"
    chmod 400 $KEYFILE
    chown 999:999 $KEYFILE
else
    echo "Keyfile already exists, skipping..."
fi

printf "Starting OG entrypoint...\n\n\n\n"

exec docker-entrypoint.sh $@