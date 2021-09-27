(ns gpml.db.non-member-organisation
  (:require [hugsql.core :as hugsql]
            [clojure.java.jdbc :as jdbc]))

(hugsql/def-db-fns "gpml/db/non-member-organisation.sql")
