(ns gpml.db.resource.detail
  #:ns-tracker{:resource-deps ["resource/detail.sql"]}
  (:require
   [clojure.java.jdbc :as jdbc]
   [dev.gethop.rbac :as rbac]
   [gpml.db.resource.related-content :as db.resource.detail]
   [hugsql.core :as hugsql]))

(declare get-resource
         delete-resource*)

(hugsql/def-db-fns "gpml/db/resource/detail.sql" {:quoting :ansi})

(defn- delete-resource-related-contents [conn {:keys [id type]}]
  (try
    (db.resource.detail/delete-related-contents conn
                                                {:resource-id id
                                                 :resource-table-name type})
    {:success? true}
    (catch Exception t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn delete-resource [conn logger {:keys [id type rbac-context-type] :as opts}]
  (try
    (jdbc/with-db-transaction [tx conn]
      (when-not (:success? (rbac/delete-context! tx logger {:context-type-name rbac-context-type
                                                            :resource-id id}))
        (throw (ex-info "Failed to delete RBAC context." {:reason :failed-to-delete-rbac-context})))
      (when-not (:success? (delete-resource-related-contents tx opts))
        (throw (ex-info "Failed to delete related contents." {:reason :failed-to-delete-related-contents})))
      (when-not (= 1 (delete-resource* tx {:table-name type :id id}))
        (throw (ex-info "Failed to delete resource." {:reason :unexpected-number-of-affected-rows})))
      {:success? true})
    (catch Exception t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))
