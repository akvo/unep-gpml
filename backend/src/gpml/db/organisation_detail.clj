(ns gpml.db.organisation-detail
  {:ns-tracker/resource-deps ["organisation_detail.sql"]}
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/organisation_detail.sql")
