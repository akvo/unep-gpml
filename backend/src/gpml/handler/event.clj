(ns gpml.handler.event
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.db.event :as db.event]
            [gpml.db.language :as db.language]
            [gpml.handler.auth :as h.auth]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.email-util :as email]
            [gpml.auth :as auth]
            [integrant.core :as ig]
            [ring.util.response :as resp])
  (:import [java.time Instant]
           [java.sql Timestamp])
  )

(defn create-event [conn {:keys [tags urls title start_date end_date
                                 url
                                 description remarks geo_coverage_type
                                 country city geo_coverage_value photo
                                 geo_coverage_countries geo_coverage_country_groups
                                 created_by mailjet-config owners]}]
  (let [data {:title title
              :start_date start_date
              :end_date end_date
              :url url
              :description (or description "")
              :remarks remarks
              :image (handler.image/assoc-image conn photo "event")
              :geo_coverage_type geo_coverage_type
              :geo_coverage_value geo_coverage_value
              :geo_coverage_countries geo_coverage_countries
              :geo_coverage_country_groups geo_coverage_country_groups
              :city city
              :country country
              :owners owners
              :created_by created_by}
        event-id (:id (db.event/new-event data conn) )]
    (when (not-empty tags)
      (db.event/add-event-tags conn {:tags (map #(vector event-id %) tags)}))
    (when (not-empty owners)
      (doseq [stakeholder-id owners]
        (h.auth/grant-topic-to-stakeholder! conn {:topic-id event-id
                                                  :topic-type "event"
                                                  :stakeholder-id stakeholder-id
                                                  :roles ["owner"]})))
    (when (not-empty urls)
      (let [lang-urls (map #(vector event-id
                                    (->> % :lang
                                         (assoc {} :iso_code)
                                         (db.language/language-by-iso-code conn)
                                         :id)
                                    (:url %)) urls)]
        (db.event/add-event-language-urls conn {:urls lang-urls})))
    (if (or (not-empty geo_coverage_country_groups)
            (not-empty geo_coverage_countries))
      (let [geo-data (handler.geo/get-geo-vector-v2 event-id data)]
        (db.event/add-event-geo-coverage conn {:geo geo-data}))
      (when (not-empty geo_coverage_value)
        (let [geo-data (handler.geo/get-geo-vector event-id data)]
          (db.event/add-event-geo-coverage conn {:geo geo-data}))))
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge data {:type "event"}))))

(def post-params
  (->
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
    [:country {:optional true} integer?]
    [:city {:optional true} string?]
    [:urls {:optional true}
     [:vector {:optional true}
      [:map
       [:lang string?]
       [:url [:string {:min 1}]]]]]
    auth/owners-schema
    [:tags {:optional true}
     [:vector {:optional true} integer?]]]
   (into handler.geo/params-payload)))

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
