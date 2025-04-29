#!/bin/sh
# wait-for-es.sh

set -e

host="$1"
shift

echo "Waiting for Elasticsearch at $host to be ready..."
until curl -s -f "$host" > /dev/null; do
  echo "Elasticsearch is unavailable - sleeping for 2 seconds"
  sleep 2
done

echo "Elasticsearch is up - continuing with application startup"