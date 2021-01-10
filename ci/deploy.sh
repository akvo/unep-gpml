#!/usr/bin/env bash
#shellcheck disable=SC2039

set -exuo pipefail


image_prefix="eu.gcr.io/akvo-lumen/unep-gpml"

[[ "${CI_BRANCH}" !=  "main" ]] && { echo "Branch different than main. Skip deploy"; exit 0; }
[[ "${CI_PULL_REQUEST}" ==  "true" ]] && { echo "Pull request. Skip deploy"; exit 0; }

gcloud auth activate-service-account --key-file=/home/semaphore/.secrets/gcp.json
gcloud config set project akvo-lumen
gcloud config set container/cluster europe-west1-d
gcloud config set compute/zone europe-west1-d
gcloud config set container/use_client_certificate False

gcloud auth configure-docker

docker push "${image_prefix}/backend:${CI_COMMIT}"
docker push "${image_prefix}/frontend:${CI_COMMIT}"
