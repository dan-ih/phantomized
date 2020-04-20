#!/bin/bash -e

function cleanup {
  docker rm phantomized
}

docker build --rm -t phantomized .
trap cleanup EXIT
docker run --name phantomized -e PHANTOM_VERSION=2.1.1 phantomized
docker cp phantomized:/app/dockerized-phantomjs.tar.gz ./
