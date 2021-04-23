(ns gpml.handler.technology
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.db.language :as db.language]
            [gpml.db.technology :as db.technology]
            [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn create-technology [conn {:keys [name organisation_type
                                      development_stage specifications_provided
                                      year_founded email country
                                      geo_coverage_type geo_coverage_value
                                      tags url urls created_by image
                                      logo attachments remarks]}]
  (let [data {:name name
              :year_founded year_founded
              :organisation_type organisation_type
              :development_stage development_stage
              :specifications_provided specifications_provided
              :email email
              :url url
              :country country
              :image (handler.image/assoc-image conn image "technology")
              :logo (handler.image/assoc-image conn logo "technology")
              :geo_coverage_type geo_coverage_type
              :geo_coverage_value geo_coverage_value
              :remarks remarks
              :attachments attachments
              :created_by created_by
              :review_status "SUBMITTED"}
        technology-id (->> data (db.technology/new-technology conn) :id)]
    (when (not-empty tags)
      (db.technology/add-technology-tags
        conn {:tags (map #(vector technology-id %) tags)}))
    (when (not-empty urls)
      (let [lang-urls (map #(vector technology-id
                                    (->> % :lang
                                         (assoc {} :iso_code)
                                         (db.language/language-by-iso-code conn)
                                         :id)
                                    (:url %)) urls)]
        (db.technology/add-technology-language-urls conn {:urls lang-urls})))
    (when (not-empty geo_coverage_value)
      (let [geo-data (handler.geo/id-vec-geo conn technology-id data)]
        (when (not-empty geo-data)
          (db.technology/add-technology-geo conn {:geo geo-data}))))
    technology-id))

(defmethod ig/init-key :gpml.handler.technology/post [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [user (db.stakeholder/stakeholder-by-email conn jwt-claims)
            technology-id (create-technology conn (assoc body-params :created_by (:id user)))]
    (resp/created (:referrer req) {:message "New technology created" :id technology-id})))))

(def post-params
  [:map
   [:name string?]
   [:year_founded integer?]
   [:organisation_type {:optional true}
    [:enum "Established Company", "Research Lab", "Academic Institution",
     "Startup", "Non-Profit Org", "Partnerships"]]
   [:development_stage {:optional true}
    [:enum "In market", "Scale up", "Prototype", "Pilot"
     "Development", "Research"]]
   [:country integer?]
   [:geo_coverage_type
    [:enum "global", "regional", "national", "transnational",
     "sub-national", "global with elements in specific areas"]]
   [:geo_coverage_value {:optional true}
    [:vector {:min 1 :error/message "Need at least one geo coverage value"} string?]]
   [:image {:optional true} string?]
   [:logo {:optional true} string?]
   [:tags {:optional true}
    [:vector {:optional true} integer?]]
   [:url {:optional true} string?]
   [:urls {:optional true}
    [:vector {:optional true}
     [:map [:lang string?] [:url [:string {:min 1}]]]]]])

(defmethod ig/init-key :gpml.handler.technology/post-params [_ _]
  post-params)
