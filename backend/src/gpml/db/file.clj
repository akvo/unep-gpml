(ns gpml.db.file
  {:ns-tracker/resource-deps ["file.sql"]}
  (:require [gpml.db.jdbc-util :as jdbc-util]
            [hugsql.core :as hugsql]))

(declare create-file*
         delete-file*
         get-files*)

(hugsql/def-db-fns "gpml/db/file.sql")

(defn- file->persistence-file
  [file]
  (update file :visibility name))

(defn- persistence-file->file
  [persistence-file]
  (update persistence-file :visibility keyword))

(defn create-file
  [conn file]
  (jdbc-util/with-constraint-violation-check
    [{:type :unique
      :name "file_pkey"
      :error-reason :already-exists}]
    (create-file* conn (-> file
                           file->persistence-file
                           jdbc-util/db-params-kebab-kw->db-params-snake-kw))
    {:success? true}))

(defn delete-file
  [conn file-id]
  (try
    (let [affected (delete-file*
                    conn
                    {:id file-id})]
      (if (= 1 affected)
        {:success? true}
        {:success? false
         :reason :not-found}))
    (catch Throwable t
      {:success? false
       :error-details {:ex-message (ex-message t)}})))

(defn get-files
  [conn opts]
  (try
    (let [db-params (jdbc-util/db-params-kebab-kw->db-params-snake-kw opts)
          files (get-files* conn db-params)]
      {:success? true
       :files (map
               (comp persistence-file->file
                     jdbc-util/db-result-snake-kw->db-result-kebab-kw)
               files)})
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details (ex-message t)})))

(defn get-file
  [conn opts]
  (try
    (let [result (get-files conn opts)]
      (if-not (:success? result)
        result
        (if (= (count (:files result)) 1)
          {:success? true
           :file (-> result :files first)}
          {:success? false
           :reason :not-found})))
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details (ex-message t)})))
