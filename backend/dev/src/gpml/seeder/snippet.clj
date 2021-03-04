(ns gpml.seeder.snippet
  (:require [hugsql.core :as hugsql]
            [clojure.java.jdbc :as jdbc]))

(hugsql/def-db-fns "gpml/seeder/snippet.sql")

(defn set-default-sequence [db data]
  (jdbc/db-do-commands db (format "ALTER TABLE %1$s ALTER COLUMN id SET DEFAULT nextval('%1$s')"
                                  (:tbl data))))
