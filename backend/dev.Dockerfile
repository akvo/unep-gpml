FROM akvo/akvo-clojure-lein:20210124.114043.4437caf

COPY project.clj .

RUN lein deps
