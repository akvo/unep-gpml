.PHONY: test kondo eastwood cljfmt lint clean repl lein-repl uberjar pedantic
HOME=$(shell echo $$HOME)
HERE=$(shell echo $$PWD)

# Allows you to simply type `make`, the default task will be run for you.
.DEFAULT_GOAL := lein-repl

# Set bash instead of sh for the @if [[ conditions,
# and use the usual safety flags:
SHELL = /usr/bin/env bash -Eeu

# The Lein profiles that will be selected for `lein-repl`.
# Feel free to upgrade this, or to override it with an env var named LEIN_PROFILES.
# Expected format: "+dev,+test"
# Don't use spaces here.
LEIN_PROFILES ?= "+dev,+test"

# The enrich-classpath version to be injected.
# Feel free to upgrade this.
ENRICH_CLASSPATH_VERSION="1.19.0"

# Create and cache a `java` command. project.clj is mandatory; the others are optional but are taken into account for cache recomputation.
# It's important not to silence with step with @ syntax, so that Enrich progress can be seen as it resolves dependencies.
.enrich-classpath-lein-repl: Makefile project.clj $(wildcard checkouts/*/project.clj) $(wildcard deps.edn) $(wildcard $(HOME)/.clojure/deps.edn) $(wildcard profiles.clj) $(wildcard $(HOME)/.lein/profiles.clj) $(wildcard $(HOME)/.lein/profiles.d) $(wildcard /etc/leiningen/profiles.clj)
	bash 'lein' 'update-in' ':plugins' 'conj' "[mx.cider/lein-enrich-classpath \"$(ENRICH_CLASSPATH_VERSION)\"]" '--' 'with-profile' $(LEIN_PROFILES) 'update-in' ':middleware' 'conj' 'cider.enrich-classpath.plugin-v2/middleware' '--' 'repl' | grep " -cp " > $@

# Launches a repl, falling back to vanilla lein repl if something went wrong during classpath calculation.
lein-repl: .enrich-classpath-lein-repl
	@if grep --silent " -cp " .enrich-classpath-lein-repl; then \
		eval "$$(cat .enrich-classpath-lein-repl) --interactive"; \
	else \
		echo "Falling back to lein repl... (you can avoid further falling back by removing .enrich-classpath-lein-repl)"; \
		lein with-profiles $(LEIN_PROFILES) repl; \
	fi

clean:
	lein clean

test: clean
	lein with-profile -user,-dev,+test,+seeder,+eftest eftest

cljfmt:
	lein with-profile -user,+test,+seeder,+cljfmt cljfmt check

cljfmt-fix:
	lein with-profile -user,+test,+seeder,+cljfmt cljfmt fix

eastwood:
	lein with-profile -user,-dev,+test,+seeder,+eastwood eastwood

.make_kondo_prep: project.clj .clj-kondo/config.edn
	lein with-profile -dev,+test,+seeder,+clj-kondo clj-kondo --copy-configs --dependencies --parallel --lint '$$classpath' > $@

kondo: .make_kondo_prep clean
	lein with-profile -dev,+test,+seeder,+clj-kondo clj-kondo

repl: lein-repl

pedantic:
	lein with-profile uberjar deps

lint: pedantic kondo cljfmt eastwood

psql:
		psql -h localhost -p 5432 -d gpml -U unep

psql_test:
		psql -h localhost -p 5432 -d gpml_test -U unep

uberjar: clean
		UBERJAR_IN_COURSE=true lein with-profile uberjar uberjar
