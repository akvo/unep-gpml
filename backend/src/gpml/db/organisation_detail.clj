(ns gpml.db.organisation-detail
  (:require [hugsql.core :as hugsql]))

(hugsql/def-db-fns "gpml/db/organisation_detail.sql")
