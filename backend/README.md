# GPML Digital Platform

### Development

The backend-specific `docker-compose.yml` helps if you want to run a Postgresql db without running the monorepo's `docker-compose.yml`.

The included `Makefile` includes a variety of convenient tasks. By typing simply `make`, you'll get a nrepl repl with [enrich-classpath](https://github.com/clojure-emacs/enrich-classpath) in, that you can `cider-connect-clj` to.
