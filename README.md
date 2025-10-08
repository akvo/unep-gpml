# UNEP - GPML Digital Platform

[![Build Status](https://akvo.semaphoreci.com/badges/unep-gpml/branches/main.svg?style=shields)](https://akvo.semaphoreci.com/projects/unep-gpml)
[![QA](https://github.com/akvo/unep-gpml/actions/workflows/qa.yml/badge.svg?branch=main)](https://github.com/akvo/unep-gpml/actions/workflows/qa.yml)

## Development

### Requirements

* [docker-compose](https://docs.docker.com/compose/)


### Usual commands

* Start the development environment: `docker-compose up -d`
* Stop dev environment: `docker-compose down`
* If you want to clean up all the stored data use `-v`: `docker-compose down -v`

Website will be available at [http://localhost:3001](http://localhost:3001).

After you signup, you can approve your user and make him admin with:

    ./dc.sh exec db psql -U unep -d gpml -c "UPDATE stakeholder SET review_status='APPROVED', role='ADMIN' WHERE email='<your email here>'"


### Backend development

Backend API is available at [http://localhost:3000](http://localhost:3000)

#### Connect to REPL

You can connect to the REPL using your IDE tools or using the backend container

```
docker compose exec backend lein repl :connect localhost:47480
```

#### Creating a super admin user

Run the following command in the REPL

```clojure
(make-user! "<user email here>")
```

Run the following command in the terminal shell

```
docker compose exec db psql -U unep -d gpml -c "UPDATE stakeholder SET review_status='APPROVED', role='ADMIN' WHERE email='<your email here>'"
docker compose exec db psql -U unep -d gpml -c "INSERT INTO rbac_super_admin(user_id) SELECT id FROM stakeholder WHERE email='<user email here>'"
```

#### Reload code changes

To "injects" the new bytecode into the running JVM, run the following command in the REPL

```clojure
(refresh)
(go)
```

#### Local config file

Copy the `backend/dev/resources/local.example.edn` file to `backend/dev/resources/local.edn`.

#### Print log to the stdout

Logs are helpful when debugging errors. Edit `backend/dev/resources/local.edn` and add the following lines

```clojure
{
  ;; ...

  ;; print log to stdout
  :duct.logger.timbre/println   {}
  :duct.logger/timbre           {:set-root-config?  true
                                 :level             :info
                                 :appenders         {:println #ig/ref :duct.logger.timbre/println}}
  ;; ...
}
```

#### Store uploaded image to local storage

Edit `backend/dev/resources/local.edn` and add the following lines

```clojure
{
  ;; ...

  [:duct/const :gpml.config/common] {:storage-client-adapter #ig/ref :mocks.boundary.adapter.storage-client/local-file-system
                                     :storage-bucket-name #duct/env ["LOCAL_FS_STORAGE_BUCKET_NAME" Str]}
  ;; ...
}
```

#### Mock the chat service

Edit `backend/dev/resources/local.edn` and add the following lines

```clojure
{
  ;; ...

  :mocks.boundary.adapter.chat/ds-chat  {}
  [:duct/const :gpml.config/common]     {:chat-adapter  #ig/ref :mocks.boundary.adapter.chat/ds-chat}

  ;; ...
}
```

## CI/CD

### GitHub Actions

The project uses GitHub Actions for continuous integration and deployment:

#### QA Workflow (`.github/workflows/qa.yml`)

Runs on:
- All pull requests
- Pushes to `main` branch

The workflow consists of three jobs:

1. **Backend QA** - Runs in parallel
   - Migration validation
   - clj-kondo linting
   - Eastwood linting
   - Unit tests (eftest)
   - Uberjar build verification
   - Caches Maven dependencies (`~/.m2`) and Lein dependencies (`~/.lein`)

2. **Frontend QA** - Runs in parallel
   - Node modules installation
   - ESLint linting
   - Next.js build
   - Caches node_modules

3. **Integration Tests** - Runs after both QA jobs complete
   - Builds all Docker images
   - Runs end-to-end API tests
   - Tests authentication flows
   - Validates HTTP endpoints

#### Deployment Workflow (`.github/workflows/deploy-hpa.yml`)

Handles deployment to Kubernetes:
- Builds production Docker images (nginx, frontend, backend, strapi)
- Pushes images to container registry
- Performs Kubernetes rollout

### Migration from Semaphore CI

The project is in the process of migrating from Semaphore CI to GitHub Actions. Currently both systems are running:
- **Semaphore CI**: Legacy build system (to be deprecated)
- **GitHub Actions**: New QA and deployment workflows

Once GitHub Actions is fully validated, Semaphore CI will be deprecated and the `ci/` folder will be removed.
