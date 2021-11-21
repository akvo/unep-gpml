(ns gpml.handler.initiative
  (:require [integrant.core :as ig]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.handler.geo :as handler.geo]
            [clojure.java.jdbc :as jdbc]
            [gpml.db.initiative :as db.initiative]
            [gpml.email-util :as email]
            [ring.util.response :as resp]))

(defn- add-geo-initiative [conn initiative-id {:keys [geo_coverage_country_groups geo_coverage_countries] :as data}]
  (when (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
    (let [geo-data (handler.geo/get-geo-vector-v2 initiative-id data)]
      (db.initiative/add-initiative-geo-coverage conn {:geo geo-data}))))

(defn update-geo-initiative [conn initiative-id {:keys [geo_coverage_country_groups geo_coverage_countries] :as data}]
  (when (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
    (let [geo-data (handler.geo/get-geo-vector-v2 initiative-id data)]
      (db.initiative/delete-initiative-geo-coverage conn {:id initiative-id})
      (db.initiative/add-initiative-geo-coverage conn {:geo geo-data}))))

(defn extract-geo-data [params]
  {:geo_coverage_country_groups (mapv (comp #(Integer/parseInt %) name ffirst) (:q24_4 params))
   :geo_coverage_countries (mapv (comp #(Integer/parseInt %) name ffirst) (:q24_2 params))})

(defmethod ig/init-key :gpml.handler.initiative/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (let [conn (:spec db)
          user (db.stakeholder/stakeholder-by-email conn jwt-claims)
          data (assoc body-params :created_by (:id user))
          initiative-id (jdbc/with-db-transaction [tx-conn conn]
                          (let [initiative-id (db.initiative/new-initiative tx-conn data)]
                            (add-geo-initiative tx-conn (:id initiative-id) (extract-geo-data data))
                            initiative-id))]
      (email/notify-admins-pending-approval
       conn
       mailjet-config
       {:type "initiative" :title (:q2 data)})
      (resp/created
       (:referrer req)
       (merge initiative-id {:message "New initiative created"})))))

(defmethod ig/init-key :gpml.handler.initiative/get [_ {:keys [db]}]
  (fn [{{{:keys [id]} :path} :parameters}]
    (let [conn (:spec db)
          data (db.initiative/initiative-by-id conn {:id id})]
      (resp/response data))))

(defmethod ig/init-key :gpml.handler.initiative/post-params [_ _]
  [:map [:version integer?]])
