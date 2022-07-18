(ns gpml.seeder.db
  (:require [clojure.java.jdbc :as jdbc]
            [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/seeder/db.sql")

(defn set-default-sequence [db data]
  (jdbc/db-do-commands db (format "ALTER TABLE %1$s ALTER COLUMN id SET DEFAULT nextval('%2$s')"
                                  (:tbl data) (:tbl_seq data))))
