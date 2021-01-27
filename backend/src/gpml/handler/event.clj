(ns gpml.handler.event
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [gpml.db.country :as db.country]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.event :as db.event]
            [gpml.db.event-image :as db.event-image]
            [gpml.db.language :as db.language]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn assoc-image [conn photo]
  (if photo
    (str/join ["/image/event/" (:id (first (db.event-image/new-event-image conn {:image photo})))])
    nil))

(defn create-event [conn {:keys [tags urls title start_date end_date
                                 description remarks geo_coverage_type
                                 country city geo_coverage_value photo]}]
  (let [data {:title title
              :start_date start_date
              :end_date end_date
              :description (or description "")
              :remarks remarks
              :image (assoc-image conn photo)
              :geo_coverage_type geo_coverage_type
              :city city
              :country (->> {:name country} (db.country/country-by-code conn) :id)}
        event-id (->> data (db.event/new-event conn) first :id)]
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
      (let [geo-data
            (cond
              (contains?
               #{"regional" "global with elements in specific areas"}
               geo_coverage_type)
              (->> {:names geo_coverage_value}
                   (db.country-group/country-group-by-names conn)
                   (map #(vector event-id (:id %) nil)))
              (contains?
               #{"national" "transnational"}
               geo_coverage_type)
              (->> {:codes geo_coverage_value}
                   (db.country/country-by-codes conn)
                   (map #(vector event-id nil (:id %)))))]
        (when (some? geo-data)
          (db.event/add-event-geo-coverage conn {:geo geo-data}))))))

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

(defmethod ig/init-key :gpml.handler.event/post [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params] :as req}]
    (tap> jwt-claims)
    (jdbc/with-db-transaction [conn (:spec db)]
      (create-event conn body-params))
    (resp/created (:referrer req) {:message "New event created"})))

(defmethod ig/init-key :gpml.handler.event/post-params [_ _]
  post-params)

(defmethod ig/init-key :gpml.handler.event/pending [_ {:keys [db]}]
  (fn [_]
    (resp/response (db.event/pending-events (:spec db)))))

(defmethod ig/init-key :gpml.handler.event/approve [_ {:keys [db]}]
  (fn [{:keys [body-params]}]
    (if-let [_ (db.event/pending-event-by-id (:spec db) body-params)]
      (do
        (db.event/approve-event (:spec db) body-params)
        (resp/response {:message "Successfully Updated"
                        :data (db.event/event-by-id (:spec db body-params))}))
      (resp/bad-request {:message (format "Event id %s does not exist" (:id body-params)) }))))
