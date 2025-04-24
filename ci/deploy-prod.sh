#!/usr/bin/env bash
#shellcheck disable=SC2039

set -Eeuxo pipefail

[[ "${CI_BRANCH}" !=  "main" && ! "${CI_TAG:=}" =~ promote.* ]] && { echo "Branch different than main and not a tag. Skip deploy"; exit 0; }
[[ "${CI_PULL_REQUEST}" ==  "true" ]] && { echo "Pull request. Skip deploy"; exit 0; }

auth () {
    gcloud auth activate-service-account --key-file=/home/semaphore/.secrets/gcp.json
    gcloud config set project akvo-lumen
    gcloud config set container/cluster europe-west1-d
    gcloud config set compute/zone europe-west1-d
    gcloud config set container/use_client_certificate False
    gcloud auth configure-docker "eu.gcr.io"
}

push_image () {
    prefix="eu.gcr.io/akvo-lumen/unep-gpml"

    if [[ "${CI_TAG:=}" =~ promote.* ]]; then
        docker push "${prefix}/${1}:${CI_COMMIT}-prod"
    fi
}

prepare_deployment () {

    if [[ "${CI_TAG:=}" =~ promote.* ]]; then
	cluster="production"
        APP_NAME="UNEP GPML"
        APP_DOMAIN="globalplasticshub.org"
        gcloud container clusters get-credentials "${cluster}"

        sed -e "s/\${CI_COMMIT}/${CI_COMMIT}-prod/g; s/\${APP_NAME}/${APP_NAME}/g; s/\${APP_DOMAIN}/${APP_DOMAIN}/g" \
            ci/k8s/deployment.template.yml \
            > ci/k8s/deployment.yml
    fi

}

apply_deployment () {
    kubectl apply -f ci/k8s/deployment.yml
    kubectl apply -f ci/k8s/service.yml
    kubectl apply -f redirect/redirect.yml
}

auth

if [[ -n "${CI_TAG:=}" ]]; then
    push_image frontend
fi


prepare_deployment
apply_deployment

ci/k8s/wait-for-k8s-deployment-to-be-ready-prod.sh
