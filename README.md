# UNEP - GPML Digital Platform

[![Build Status](https://akvo.semaphoreci.com/badges/unep-gpml/branches/main.svg?style=shields)](https://akvo.semaphoreci.com/projects/unep-gpml)

## Architecture Diagram

```mermaid
graph TD
   subgraph "Kubernetes Cluster"
       direction LR
       subgraph pod["Pod (unep-gpml)"]
           direction TB
           nginx("<i class='fa fa-server'></i> Nginx<br>Container<br>Port: 80")
           frontend("<i class='fa fa-window-maximize'></i> Frontend<br>Container<br>Port: 3001")
           backend("<i class='fa fa-cogs'></i> Backend<br>Container<br>Port: 3000")
           strapi("<i class='fa fa-pen-alt'></i> Strapi (CMS)<br>Container<br>Port: 1337")
           proxy("<i class='fa fa-database'></i> Cloud SQL Proxy<br>Sidecar")

           nginx -->|"Port 3001"| frontend
           nginx -->|"Port 3000"| backend
           nginx -->|"Port 1337"| strapi
           frontend -.-> backend
           backend -->|"localhost:5432"| proxy
           strapi  -->|"localhost:5432"| proxy
       end

       svc("Service: unep-gpml<br>Type: NodePort<br>Port: 80")
       cm("<i class='fa fa-file-alt'></i> ConfigMap<br>unep-gpml")
       secret("<i class='fa fa-key'></i> Secrets<br>unep-gpml")

       svc --> nginx
       cm -- "Provides DB info" --> proxy
       secret -- "Provides Credentials" --> proxy
       secret -- "Provides ENV Vars" --> frontend
       secret -- "Provides API Keys & Credentials" --> backend
       secret -- "Provides DB/GCS Credentials" --> strapi
   end

   subgraph "External Services"
       direction TB
       subgraph "Google Cloud Platform"
           db("<i class='fa fa-database'></i> Google Cloud SQL DB<br>(unep-gpml-db)")
           gcs("<i class='fa fa-cloud'></i> Google Cloud Storage")
       end
       auth0("<i class='fa fa-lock'></i> Auth0 / OIDC Provider")
       sentry("<i class='fa fa-bug'></i> Sentry.io")
       mailjet("<i class='fa fa-envelope'></i> Mailjet")
       brs("<i class='fa fa-file'></i> BRS API")
       leap("<i class='fa fa-user-gear'></i> LEAP API")
       openai("<i class='fa fa-robot'></i> OpenAI API")
       chat("<i class='fa fa-comments'></i> Dead Simple Chat")
   end

   user([<i class='fa fa-user'></i> External User / Traffic]) --> svc

   proxy -->|Secure TCP Connection| db
   frontend -.-> gcs
   backend --> gcs
   strapi --> gcs
   backend --> auth0
   frontend --> auth0
   backend --> sentry
   frontend --> sentry
   backend --> mailjet
   backend --> brs
   backend --> leap
   backend --> chat
   backend --> openai

   %% Styling
   style pod fill:#fafafa,stroke:#dddddd,stroke-width:2px
   style svc fill:#dae8fc,stroke:#6c8ebf
   style cm fill:#fff2cc,stroke:#d6b656
   style secret fill:#f8cecc,stroke:#b85450
```

## Development

### Requirements

* [docker-compose](https://docs.docker.com/compose/)


### Usual commands

* Start the development environment: `docker-compose up -d`
* Stop dev environment: `docker-compose down`
* If you want to clean up all the stored data use `-v`: `docker-compose down -v`

Website will be available at [http://localhost:3001](http://localhost:3001).

After you signup, you can approve your user and make him admin with:

    docker compose exec db psql -U unep -d gpml -c "UPDATE stakeholder SET review_status='APPROVED', role='ADMIN' WHERE email='<your email here>'"


### Backend development

Backend API is available at [http://localhost:3000](http://localhost:3000)

#### Connect to REPL

You can connect to the REPL using your IDE tools or using the backend container

```
docker compose exec backend lein repl :connect localhost:47480
```

The REPL (Read-Eval-Print Loop) enables **interactive Clojure development** where you can:

**Common Use Cases:**
- **Live Code Reloading**: Make changes and reload without restarting the server
- **Interactive Development**: Test functions as you write them with real data
- **System Administration**: Create users, query database state, test API endpoints
- **Debugging**: Inspect running system state and experiment with data transformations
- **Hot-fixing**: Fix data inconsistencies or test fixes on the fly

**Typical REPL Workflow:**
```clojure
;; Test functions immediately
(db/get-stakeholder-by-email "user@example.com")

;; Experiment with data transformations
(->> (db/get-policies)
     (filter #(= (:status %) "APPROVED"))
     (map :title)
     (take 5))

;; Create users programmatically
(make-user! "admin@example.com")
```

This makes Clojure development incredibly productive compared to traditional compile-restart-test cycles.

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

The `local.edn` file configures **development-specific overrides** for the Clojure application:

**Main Configuration Areas:**
- **Authentication Bypassing**: Disables authentication checks during development for easier API testing
- **Middleware Replacement**: Replaces production authentication middleware with bypass middleware
- **Service Mocking**: Replace external services (chat, storage) with local mocks
- **Enhanced Logging**: Enable detailed console logging for debugging

**Development Benefits:**
- **No Auth Required**: Test APIs without managing JWT tokens
- **Local Storage**: Avoid cloud storage setup during development  
- **Quick Iteration**: Modify config and reload instantly via REPL `(refresh)` and `(go)`
- **Service Independence**: Test without external dependencies

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

**When Local Storage is Useful:**
- **Quick Development Setup**: New developers can start immediately without cloud storage credentials
- **Faster Development Cycle**: No network latency, offline development, faster tests
- **Cost Savings**: Avoid cloud storage charges during development
- **Easy Debugging**: Direct file access for inspecting uploaded content (user avatars, organization logos, documents)
- **Test Data Management**: Simply delete local folders to reset test state

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

**What Still Works with Chat Mocking:**
- **API Endpoints**: Chat routes respond successfully with proper validation
- **Database Operations**: Channel metadata, user memberships, permissions, bookmarks
- **Application Logic**: Channel creation for plastic strategies, team management, invitation workflows

**What Won't Work:**
- **Real-time Messaging**: No actual message sending/receiving or live updates
- **External Integration**: No Dead Simple Chat server connection
- **Live Communication**: No team collaboration, file sharing within chat, or user presence tracking

**Development Strategy**: Use mocks for rapid API/logic development, test with real chat service in staging for integration validation.

### Local Development Notes and Considerations

Currently, our local development setup doesn't fully support integrated frontend and backend services. This is because our frontend and backend teams work independently, communicating their needs and changes without directly interacting with each other's codebases. As a result, seamless local integration hasn't been a high priority.

Typically, the backend team tests their APIs locally using dummy data to ensure they meet requirements. Meanwhile, the frontend team develops by connecting to the API deployed on the testing server, utilizing the data already present there.

#### Potential Local Development Issues

You might encounter a couple of issues when trying to integrate locally:

**1. API Proxy Configuration:**

- The frontend's default backend target is http://backend:3000 (found in `frontend/next.config.js:65`).
- This won't resolve correctly due to how our Docker Compose networking is set up.

**2. Missing Auth0 Credentials:**

- While some Auth0 environment variables are in place, they may lack actual values for complete functionality.
- We don't currently have a dedicated Auth0 account for local development.
- We also don't use a local Auth0 mock service, so local development doesn't inherently require connecting to Auth0.

#### Workarounds for Local Development
To overcome these challenges, here are some workarounds:

**Frontend Development**
- Set `REACT_APP_FEENV=true`: This environment variable configures your local frontend to connect directly to the backend running on the test server.

**Backend Development**
- Bypass Authentication (Recommended for local dev): You can bypass Auth0 authentication by modifying your `backend/dev/resources/local.edn` file.
- Use Auth0 Authentication (Optional): If you need to test with Auth0, you'll have to:
  * Create a user in your local Auth0 with the exact same email as a user on the test server.
  * Obtain an Auth0 token from the test server. The easiest way to get this token is to:
    - Log in to the test server.
    - Go to your user profile page.
    - Open your browser's network traffic inspection tools.
    - Refresh the profile page.
    - Find the /profile endpoint request and copy the value from its Authorization header.
