(ns gpml.db.organisation-non-member
  (:require [hugsql.core :as hugsql]
            [clojure.java.jdbc :as jdbc]))

(hugsql/def-db-fns "gpml/db/organisation-non-member.sql")
