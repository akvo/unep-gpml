(ns gpml.handler.submission
  (:require [gpml.db.submission :as db.submission]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defmethod ig/init-key :gpml.handler.submission/get [_ {:keys [db]}]
  (fn [{{:keys [query]} :parameters}]
    (let [submission (-> (db.submission/pages (:spec db) query) :result)]
      (resp/response submission))))

(defmethod ig/init-key :gpml.handler.submission/get-detail [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters}]
    (let [tbl (:submission path)
          tbl (cond
                (contains? #{"event" "technology" "policy"} tbl)
                (str "v_" tbl "_data")
                (contains? #{"Financing Resource" "Technical Resource"} tbl)
                "v_resource_data"
                (= tbl "profile")
                "v_stakeholder_data")
          detail (db.submission/detail (:spec db) (conj path {:table-name tbl}))]
      (resp/response detail))))
