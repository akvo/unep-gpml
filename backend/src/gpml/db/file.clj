(ns gpml.db.file
  #:ns-tracker{:resource-deps ["file.sql"]}
  (:require
   [duct.logger :refer [log]]
   [gpml.db.jdbc-util :as jdbc-util]
   [gpml.util.result :refer [failure]]
   [hugsql.core :as hugsql]))

(declare create-file*
         delete-file*
         get-files*)

(hugsql/def-db-fns "gpml/db/file.sql")

(defn- file->persistence-file [file]
  (update file :visibility name))

(defn- persistence-file->file [persistence-file]
  (update persistence-file :visibility keyword))

(defn create-file [conn file]
  (jdbc-util/with-constraint-violation-check [{:type :unique
                                               :name "file_pkey"
                                               :error-reason :already-exists}]
    (create-file* conn (-> file
                           file->persistence-file
                           jdbc-util/db-params-kebab-kw->db-params-snake-kw))
    {:success? true}))

(defn delete-file [logger conn file-id]
  (try
    (let [affected (delete-file*
                    conn
                    {:id file-id})]
      (if (= 1 affected)
        {:success? true}
        (failure {:reason :not-found})))
    (catch Exception t
      (log logger :error :could-not-delete-file t)
      (failure {:error-details {:ex-message (ex-message t)}}))))

(defn get-files [logger conn opts]
  (try
    (let [db-params (jdbc-util/db-params-kebab-kw->db-params-snake-kw opts)
          files (get-files* conn db-params)]
      {:success? true
       :files (map
               (comp persistence-file->file
                     jdbc-util/db-result-snake-kw->db-result-kebab-kw)
               files)})
    (catch Exception t
      (log logger :error :could-not-get-files t)
      (failure {:reason :exception
                :error-details (ex-message t)}))))

(defn get-file [logger conn opts]
  (try
    (let [result (get-files logger conn opts)]
      (if-not (:success? result)
        result
        (if (= (count (:files result)) 1)
          {:success? true
           :file (-> result :files first)}
          (failure {:reason :not-found}))))
    (catch Exception t
      (log logger :error :could-not-get-files t)
      (failure {:reason :exception
                :error-details (ex-message t)}))))
