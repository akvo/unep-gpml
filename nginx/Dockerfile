FROM nginx:1.26.1-alpine

ENV GCS_BASE_URL=https://storage.googleapis.com/unep-gpml-public-test

# Time intervals can be specified in milliseconds, seconds, minutes, hours,
# days and so on, using the following suffixes:
#
# ms	milliseconds
# s	    seconds
# m	    minutes
# h	    hours
# d	    days
# w	    weeks
# M	    months, 30 days
# y	    years, 365 days
ENV PROXY_CACHE_VALID=6M

# Sizes can be specified in bytes, kilobytes (suffixes k and K) or megabytes (suffixes m and M), for
# example, “1024”, “8k”, “1m”.
# Offsets may be also specified in gigabytes using g or G suffixes.
ENV PROXY_MAX_SIZE=2G

COPY nginx.conf /etc/nginx/nginx.conf
COPY templates/default.conf.template /etc/nginx/templates/default.conf.template
