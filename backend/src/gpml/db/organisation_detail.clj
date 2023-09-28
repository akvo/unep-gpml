(ns gpml.db.organisation-detail
  {:ns-tracker/resource-deps ["organisation_detail.sql"]}
  (:require [hugsql.core :as hugsql]))

(declare get-content-by-org ;; FIXME: remove this method as it is not used.
         get-associated-content-by-org
         get-org-members)

(hugsql/def-db-fns "gpml/db/organisation_detail.sql")
