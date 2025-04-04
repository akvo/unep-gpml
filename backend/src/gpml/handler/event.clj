(ns gpml.handler.event
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.set :as set]
   [duct.logger :refer [log]]
   [gpml.auth :as auth]
   [gpml.db.event :as db.event]
   [gpml.db.language :as db.language]
   [gpml.domain.types :as dom.types]
   [gpml.handler.file :as handler.file]
   [gpml.handler.resource.geo-coverage :as handler.geo]
   [gpml.handler.resource.related-content :as handler.resource.related-content]
   [gpml.handler.resource.tag :as handler.resource.tag]
   [gpml.handler.responses :as r]
   [gpml.handler.util :as handler.util]
   [gpml.service.association :as srv.association]
   [gpml.service.permissions :as srv.permissions]
   [gpml.util :as util]
   [gpml.util.email :as email]
   [gpml.util.sql :as sql-util]
   [integrant.core :as ig])
  (:import
   (java.sql SQLException)))

(defn- create-event [{:keys [logger mailjet-config] :as config}
                     conn
                     user
                     {:keys [tags urls title start_date end_date
                             description remarks geo_coverage_type
                             country city geo_coverage_value image thumbnail
                             geo_coverage_countries geo_coverage_country_groups
                             geo_coverage_value_subnational_city geo_coverage_country_states
                             created_by owners url info_docs sub_content_type
                             recording document_preview related_content
                             entity_connections individual_connections language
                             capacity_building source]}]
  (let [image-id (when (seq image)
                   (handler.file/create-file config conn image :event :images :public))
        thumbnail-id (when (seq thumbnail)
                       (handler.file/create-file config conn thumbnail :event :images :public))
        data (cond-> {:title title
                      :start_date start_date
                      :end_date end_date
                      :description (or description "")
                      :remarks remarks
                      :geo_coverage_type geo_coverage_type
                      :geo_coverage_value geo_coverage_value
                      :geo_coverage_countries geo_coverage_countries
                      :geo_coverage_country_groups geo_coverage_country_groups
                      :subnational_city geo_coverage_value_subnational_city
                      :city city
                      :url url
                      :country country
                      :owners owners
                      :created_by created_by
                      :info_docs info_docs
                      :sub_content_type sub_content_type
                      :recording recording
                      :document_preview document_preview
                      :language language
                      :source source}
               (some? capacity_building)
               (assoc :capacity_building capacity_building)

               image-id
               (assoc :image_id image-id)

               thumbnail-id
               (assoc :thumbnail_id thumbnail-id))
        event-id (->>
                  (update data :source #(sql-util/keyword->pg-enum % "resource_source"))
                  (db.event/new-event conn) :id)
        api-individual-connections (handler.util/individual-connections->api-individual-connections conn individual_connections created_by)
        geo-coverage-type (keyword geo_coverage_type)
        org-associations (map #(set/rename-keys % {:entity :organisation}) entity_connections)]
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags conn logger mailjet-config {:tags tags
                                                                             :tag-category "general"
                                                                             :resource-name "event"
                                                                             :resource-id event-id}))
    (srv.permissions/create-resource-context
     {:conn conn
      :logger logger}
     {:context-type :event
      :resource-id event-id})
    (srv.association/save-associations
     {:conn conn
      :logger logger}
     {:org-associations org-associations
      :sth-associations (if (seq api-individual-connections)
                          api-individual-connections
                          [{:role "owner"
                            :stakeholder (:id user)}])
      :resource-type "event"
      :resource-id event-id})
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents conn logger event-id "event" related_content))
    (when (not-empty urls)
      (let [lang-urls (map #(vector event-id
                                    (->> % :lang
                                         (assoc {} :iso_code)
                                         (db.language/language-by-iso-code conn)
                                         :id)
                                    (:url %)) urls)]
        (db.event/add-event-language-urls conn {:urls lang-urls})))
    (handler.geo/create-resource-geo-coverage conn
                                              :event
                                              event-id
                                              geo-coverage-type
                                              {:countries geo_coverage_countries
                                               :country-groups geo_coverage_country_groups
                                               :country-states geo_coverage_country_states})
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge data {:type "event"}))
    {:id event-id}))

(def ^:private post-params
  [:and
   (->
    [:map
     [:title string?]
     [:start_date {:optional true} string?]
     [:end_date {:optional true} string?]
     [:description {:optional true} string?]
     [:image {:optional true} [:fn (comp util/base64? util/base64-headless)]]
     [:thumbnail {:optional true} [:fn (comp util/base64? util/base64-headless)]]
     [:remarks {:optional true} string?]
     [:geo_coverage_type
      [:enum "global", "national", "transnational", "sub-national"]]
     [:geo_coverage_value_subnational_city {:optional true} string?]
     [:country {:optional true} integer?]
     [:city {:optional true} string?]
     [:url {:optional true} string?]
     [:info_docs {:optional true} string?]
     [:sub_content_type {:optional true} string?]
     [:related_content {:optional true}
      [:vector {:optional true}
       [:map {:optional true}
        [:id [:int]]
        [:type (apply conj [:enum] dom.types/resources-types)]]]]
     [:capacity_building {:optional true} boolean?]
     [:event_type {:optional true} string?]
     [:recording {:optional true} string?]
     [:document_preview {:optional true} boolean?]
     [:entity_connections {:optional true}
      [:vector {:optional true}
       [:map
        [:entity int?]
        [:role
         [:enum "owner" "implementor" "partner" "donor"]]]]]
     [:individual_connections {:optional true}
      [:vector {:optional true}
       [:map
        [:stakeholder int?]
        [:role
         [:enum "resource_editor" "owner"]]]]]
     [:urls {:optional true}
      [:vector {:optional true}
       [:map
        [:lang string?]
        [:url [:string {:min 1}]]]]]
     [:tags {:optional true}
      [:vector
       [:map
        [:id {:optional true} pos-int?]
        [:tag string?]]]]
     [:language string?]
     [:source {:default dom.types/default-resource-source
               :decode/string keyword
               :decode/json keyword}
      (apply conj [:enum] dom.types/resource-source-types)]
     auth/owners-schema]
    (into handler.geo/api-geo-coverage-schemas))
   handler.geo/api-geo-coverage-validator-schema])

(defmethod ig/init-key :gpml.handler.event/post
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [body-params parameters user]}]
    (try
      (if (= (:review_status user) "APPROVED")
        (jdbc/with-db-transaction [tx (:spec db)]
          (let [result (create-event
                        config
                        tx
                        user
                        (assoc body-params
                               :created_by
                               (:id user)
                               :source (get-in parameters [:body :source])))]
            (r/created {:success? true
                        :message "New event created"
                        :id (:id result)})))
        (r/forbidden {:message "Unauthorized"}))
      (catch Exception t
        (log logger :error :failed-to-create-event t)
        (let [response {:success? false
                        :reason :failed-to-create-event}]
          (if (instance? SQLException t)
            (r/server-error response)
            (r/server-error (assoc-in response [:error-details :error] (ex-message t)))))))))

(defmethod ig/init-key :gpml.handler.event/post-params [_ _]
  post-params)
