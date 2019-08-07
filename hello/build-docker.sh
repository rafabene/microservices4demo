#!/bin/bash
mvn package -Pnative -Dnative-image.docker-build=true
docker build -t rafabene/ms4demo:java -f src/main/docker/Dockerfile.native .