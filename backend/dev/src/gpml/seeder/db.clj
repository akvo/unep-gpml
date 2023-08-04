(ns gpml.seeder.db
  (:require [clojure.java.jdbc :as jdbc]
            [hugsql.core :as hugsql]))

(declare get-foreign-key
         update-foreign-value
         get-count
         drop-constraint
         add-constraint
         delete-rows
         set-sequence
         get-initiative-country-values)

(hugsql/def-db-fns "gpml/seeder/db.sql")

(defn set-default-sequence [db data]
  (jdbc/db-do-commands db (format "ALTER TABLE %1$s ALTER COLUMN id SET DEFAULT nextval('%2$s')"
                                  (:tbl data) (:tbl_seq data))))
