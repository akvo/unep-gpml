(ns gpml.handler.event
  (:require [integrant.core :as ig]
            ;; [ring.util.response :as resp]
            [gpml.db.event :as db.event]))

(defn create-event [conn {:keys [tags urls title start_date end_date
                                 description remarks geo_coverage_type
                                 country city]}]
  (let [data {:title title
              :start_date start_date
              :end_date end_date
              :description (or description "")
              :remarks remarks
              :geo_coverage_type geo_coverage_type
              :city city
              :country country}
        event-id (->> data (db.event/new-event conn) first :id)]
    (when (not-empty tags)
      (db.event/add-event-tags conn {:tags (map #(vector event-id %) tags)}))
    (when (not-empty urls)
      (db.event/add-event-language-urls
       conn
       {:urls (map #(vector event-id (:language %) (:url %)) urls)}))))

(def post-params
  [:map
   [:title string?]
   [:start_date string?]
   [:end_date string?]
   [:description {:optional true} string?]
   [:image {:optional true} string?]
   [:remarks {:optional true} string?]
   [:geo_coverage_type [:enum "global", "regional", "national", "transnational", "sub-national", "global with elements in specific areas"]]
   [:country {:optional true} int?]
   [:city {:optional true} string?]
   [:urls {:optional true}
    [:vector {:optional true}
     [:map
      [:lang string?]
      [:url [:string {:min 1}]]]]]])

(defmethod ig/init-key :gpml.handler.event/post [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params]}]
    (tap> jwt-claims)
    (create-event (:spec db) body-params)
    {:status 201 :body {:message "New event created"}}))

(defmethod ig/init-key :gpml.handler.event/post-params [_ _]
  post-params)
