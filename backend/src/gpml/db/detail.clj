(ns gpml.db.detail
  {:ns-tracker/resource-deps ["detail.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare get-topic-details
         get-entity-details
         update-initiative
         update-resource-table
         delete-resource-related-data
         add-resource-related-language-urls
         add-resource-related-org)

(hugsql/def-db-fns "gpml/db/detail.sql")
