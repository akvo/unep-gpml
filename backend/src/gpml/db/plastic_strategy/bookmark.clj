(ns gpml.db.plastic-strategy.bookmark
  {:ns-tracker/resource-deps ["plastic_strategy/bookmark.sql"]}
  (:require [gpml.db.jdbc-util :as jdbc-util]
            [gpml.util :as util]
            [hugsql.core :as hugsql]))

(declare create-ps-bookmark*
         delete-ps-bookmark*)

(hugsql/def-db-fns "gpml/db/plastic_strategy/bookmark.sql" {:quoting :ansi})

(defn- ps-bookmark->p-ps-bookmark
  [ps-bookmark]
  (-> ps-bookmark
      (util/update-if-not-nil :ps-bookmark-entity-col name)
      (util/update-if-not-nil :ps-bookmark-table name)
      (dissoc :entity-type)))

(defn create-ps-bookmark
  [conn {:keys [entity-type] :as ps-bookmark}]
  (let [entity-name (name entity-type)]
    (jdbc-util/with-constraint-violation-check [{:type :unique
                                                 :name (format "plastic_strategy_%s_bookmark_pkey" entity-name)
                                                 :error-reason :already-exists}]
      (create-ps-bookmark* conn (ps-bookmark->p-ps-bookmark ps-bookmark))
      {:success? true})))

(defn delete-ps-bookmark
  [conn ps-bookmark]
  (try
    (let [p-ps-bookmark (ps-bookmark->p-ps-bookmark ps-bookmark)
          affected (delete-ps-bookmark* conn p-ps-bookmark)]
      (if (= affected 1)
        {:success? true}
        {:success? false
         :reason :unexpected-number-of-affected-rows
         :error-details {:expected-affected-rows 1
                         :actual-affected-rows affected}}))
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))
