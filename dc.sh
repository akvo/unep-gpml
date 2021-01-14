#!/usr/bin/env bash
COMPOSE_HTTP_TIMEOUT=180 docker-compose -f docker-compose.yml -f docker-compose.override.yml -f docker-compose-docker-sync.yml $@