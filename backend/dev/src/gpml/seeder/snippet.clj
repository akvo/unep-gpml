(ns gpml.seeder.snippet
  (:require [hugsql.core :as hugsql]
            [clojure.string :as str]
            [clojure.java.jdbc :as jdbc]))

(hugsql/def-db-fns "gpml/seeder/snippet.sql")

(defn set-default-sequence [db param]
  (jdbc/db-do-commands db (str "ALTER TABLE " (:table param)
                               " ALTER COLUMN id SET DEFAULT"
                               " nextval('" (:seq param) "')")))

(defn prepare [param target]
  (let [k (if (:column param) (:column param) target)]
  (assoc param :key (str/join "_" [(:table param) k "fkey"]) :target target :column k)))
