(ns gpml.db.resource.tag
  #:ns-tracker{:resource-deps ["resource/tag.sql"]}
  (:require
   [hugsql.core :as hugsql]))

(declare create-resource-tags
         ;; TODO: deprecated the original function
         ;; `create-resource-tags` in favor of the one below. It uses
         ;; a more generic approach.
         create-resource-tags-v2
         get-tags-from-resources
         get-resource-tags
         delete-resource-tags)

(hugsql/def-db-fns "gpml/db/resource/tag.sql" {:quoting :ansi})

(alter-meta! #'get-tags-from-resources assoc :private true)

(defn safely-get-tags-from-resources
  "Get all the tags for all the resources"
  [db params]
  (if-not (seq (:resource-ids params))
    ;; Avoid SQL error, since ` in ()` isn't valid SQL.
    ;; This could also be avoided in .sql itself with something like ---(when (or (seq (:resource-ids params)) " WHERE rt.:i:resource-col in (:v*:resource-ids)"),
    ;; however my attempt didn't immediately succeed.
    ;; We also could migrate the query to honeysql.
    []
    (get-tags-from-resources db params)))
