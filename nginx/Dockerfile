FROM nginx:1.26.1-alpine

ENV GCS_BASE_URL=https://storage.googleapis.com/unep-gpml-public-test
ENV PROXY_CACHE_VALID=360m

COPY nginx.conf /etc/nginx/nginx.conf
COPY templates/default.conf.template /etc/nginx/templates/default.conf.template
