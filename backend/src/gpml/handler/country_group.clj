(ns gpml.handler.country-group
  (:require
   [clojure.java.jdbc :as jdbc]
   [duct.logger :refer [log]]
   [gpml.db.country-group :as db.country-group]
   [gpml.handler.responses :as r]
   [gpml.util.postgresql :as pg-util]
   [integrant.core :as ig]
   [ring.util.response :as resp]
   [taoensso.timbre :as timbre])
  (:import
   [java.sql SQLException]))

(defmethod ig/init-key :gpml.handler.country-group/get [_ {:keys [db]}]
  (fn [{{{:keys [id]} :path} :parameters}]
    (let [conn (:spec db)
          data (if id
                 (db.country-group/country-group-detail conn {:id id})
                 (db.country-group/all-country-groups conn))]
      (resp/response (or data [])))))

(defmethod ig/init-key :gpml.handler.country-group/post-params [_ _]
  (into [:map
         [:name string?]
         [:type string?]
         [:countries {:optional true}
          [:vector {:optional true}
           [:map {:optional true}
            [:id [:int]]]]]]))

(defmethod ig/init-key :gpml.handler.country-group/post [_ {:keys [db logger]}]
  (fn [{:keys [body-params]}]
    (try
      (jdbc/with-db-transaction [tx (:spec db)]
        (let [group (dissoc body-params :countries)
              countries (:countries body-params)
              group_id ((db.country-group/new-country-group tx group) :id)
              groups_of_countries (into [] (map (partial vector group_id) (map :id countries)))]
          (db.country-group/new-country-group-countries tx {:values groups_of_countries})
          (r/ok {:success? true :country_group_id group_id})))
      (catch Exception e
        (timbre/with-context+ body-params)
        (log logger :error :failed-to-create-country-group e)
        (r/server-error {:success? false
                         :reason :failed-to-create-country-group
                         :error-details {:error (if (instance? SQLException e)
                                                  (pg-util/get-sql-state e)
                                                  (.getMessage e))}})))))
