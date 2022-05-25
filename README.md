# UNEP - GPML Digital Platform

[![Build Status](https://akvo.semaphoreci.com/badges/unep-gpml/branches/main.svg?style=shields)](https://akvo.semaphoreci.com/projects/unep-gpml)

## Development

### Requirements

* [docker-compose](https://docs.docker.com/compose/)


### Usual commands

* Start the development environment: `docker-compose up -d`
* Stop dev environment: `docker-compose down`
* If you want to clean up all the stored data use `-v`: `docker-compose down -v`
* For rebuilding the backend image when deps change: `docker-compose build`

Website will be available at [http://localhost:3001](http://localhost:3001).

After you signup, you can approve your user and make him admin with:

    ./dc.sh exec db psql -U unep -d gpml -c "UPDATE stakeholder SET review_status='APPROVED', role='ADMIN' WHERE email='<your email here>'"