(ns gpml.db.plastic-strategy.file
  #:ns-tracker{:resource-deps ["plastic_strategy/file.sql"]}
  (:require
   [gpml.db.jdbc-util :as jdbc-util]
   [gpml.util :as util]
   [gpml.util.postgresql :as util.pgsql]
   [hugsql.core :as hugsql]))

(declare create-ps-file*
         delete-ps-file*
         get-ps-files*)

(hugsql/def-db-fns "gpml/db/plastic_strategy/file.sql" {:quoting :ansi})

(defn p-ps-file->ps-file
  [p-ps-file]
  (util/update-if-not-nil p-ps-file :visibility keyword))

(defn create-ps-file
  [conn ps-file]
  (jdbc-util/with-constraint-violation-check [{:type :unique
                                               :name "plastic_strategy_file_pkey"
                                               :error-reason :already-exists}]
    (create-ps-file* conn ps-file)
    {:success? true}))

(defn delete-ps-file
  [conn ps-file]
  (try
    (let [affected (delete-ps-file* conn ps-file)]
      (if (= affected 1)
        {:success? true}
        {:success? false
         :reason :unexpected-number-of-affected-rows
         :error-details {:expected-affected-rows 1
                         :actual-affected-rows affected}}))
    (catch Exception t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn get-ps-files
  [conn opts]
  (try
    (let [p-opts (update opts :filters #(util/update-if-not-nil % :files-ids util.pgsql/->JDBCArray "uuid"))]
      {:success? true
       :ps-files (->> (get-ps-files* conn p-opts)
                      jdbc-util/db-result-snake-kw->db-result-kebab-kw
                      (map p-ps-file->ps-file))})
    (catch Exception t
      (prn t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn get-ps-file
  [conn opts]
  (try
    (let [result (get-ps-files conn opts)]
      (if-not (:success? result)
        result
        (if (= (count (:ps-files result)) 1)
          {:success? true
           :ps-file (-> result :ps-files first)}
          {:success? false
           :reason :not-found})))
    (catch Exception t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))
