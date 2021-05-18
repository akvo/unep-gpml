(ns gpml.handler.event
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.country :as handler.country]
            [gpml.handler.image :as handler.image]
            [gpml.db.event :as db.event]
            [gpml.db.language :as db.language]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.email-util :as email]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn create-event [conn {:keys [tags urls title start_date end_date
                                 description remarks geo_coverage_type
                                 country city geo_coverage_value photo
                                 created_by mailjet-config]}]
  (let [data {:title title
              :start_date start_date
              :end_date end_date
              :description (or description "")
              :remarks remarks
              :image (handler.image/assoc-image conn photo "event")
              :geo_coverage_type geo_coverage_type
              :geo_coverage_value geo_coverage_value
              :city city
              :country (handler.country/id-by-code conn country)
              :created_by created_by}
        event-id (->> data (db.event/new-event conn) :id)]
    (when (not-empty tags)
      (db.event/add-event-tags conn {:tags (map #(vector event-id %) tags)}))
    (when (not-empty urls)
      (let [lang-urls (map #(vector event-id
                                    (->> % :lang
                                         (assoc {} :iso_code)
                                         (db.language/language-by-iso-code conn)
                                         :id)
                                    (:url %)) urls)]
        (db.event/add-event-language-urls conn {:urls lang-urls})))
    (when (not-empty geo_coverage_value)
      (let [geo-data (handler.geo/id-vec-geo conn event-id data)]
        (when (some? geo-data)
          (db.event/add-event-geo-coverage conn {:geo geo-data}))))
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge data {:type "event"}))))

(def post-params
  [:map
   [:title string?]
   [:start_date string?]
   [:end_date string?]
   [:description {:optional true} string?]
   [:photo {:optional true} string?]
   [:remarks {:optional true} string?]
   [:geo_coverage_type
    [:enum "global", "regional", "national", "transnational",
     "sub-national", "global with elements in specific areas"]]
   [:country {:optional true} string?]
   [:city {:optional true} string?]
   [:urls {:optional true}
    [:vector {:optional true}
     [:map
      [:lang string?]
      [:url [:string {:min 1}]]]]]
   [:tags {:optional true}
    [:vector {:optional true} int?]]
   [:geo_coverage_value {:optional true}
    [:vector {:min 1 :error/message "Need at least one geo coverage value"} string?]]])

(defmethod ig/init-key :gpml.handler.event/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (create-event conn (assoc body-params
                                :mailjet-config mailjet-config
                                :created_by
                                (-> (db.stakeholder/stakeholder-by-email conn jwt-claims) :id))))
    (resp/created (:referrer req) {:message "New event created"})))

(defmethod ig/init-key :gpml.handler.event/post-params [_ _]
  post-params)
