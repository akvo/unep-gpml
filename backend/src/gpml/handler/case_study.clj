(ns gpml.handler.case-study
  (:require [clojure.java.jdbc :as jdbc]
            [duct.logger :refer [log]]
            [gpml.db.case-study :as db.case-study]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.domain.case-study :as dom.case-study]
            [gpml.handler.auth :as h.auth]
            [gpml.handler.image :as handler.image]
            [gpml.handler.resource.geo-coverage :as handler.geo]
            [gpml.handler.resource.related-content :as handler.resource.related-content]
            [gpml.handler.resource.tag :as handler.resource.tag]
            [gpml.handler.responses :as r]
            [gpml.handler.util :as handler.util]
            [gpml.util.email :as email]
            [gpml.util.malli :as util.malli]
            [gpml.util.sql :as sql-util]
            [integrant.core :as ig]
            [malli.util :as mu])
  (:import [java.sql SQLException]))

(defn- handle-geo-coverage
  "FIXME: Add docstring"
  [conn cs-id geo-coverage-type geo-coverage-countries geo-coverage-country-groups geo-coverage-country-states]
  (let [result (handler.geo/create-resource-geo-coverage conn
                                                         :case_study
                                                         cs-id
                                                         geo-coverage-type
                                                         {:countries geo-coverage-countries
                                                          :country-groups geo-coverage-country-groups
                                                          :country-states geo-coverage-country-states})]
    (when-not (:success? result)
      (throw (ex-info "Failed to create case study's geo coverage" result)))))

(defn- handle-related-content
  "FIXME: Add docstring"
  [conn logger cs-id related_content]
  (when-not (:success? (handler.resource.related-content/create-related-contents
                        conn
                        logger
                        cs-id
                        "case_study"
                        related_content))
    (throw (ex-info "Failed to create case study's related content" {}))))

;; TODO: Move it to share space or it will be removed when refactoring permissions.
(defn- expand-entity-associations
  [entity-connections resource-id]
  (vec (for [connection entity-connections]
         {:column_name "case_study"
          :topic "case_study"
          :topic_id resource-id
          :organisation (:entity connection)
          :association (:role connection)
          :remarks nil})))

;; TODO: Move it to share space or it will be removed when refactoring permissions.
(defn- expand-individual-associations
  [individual-connections resource-id]
  (vec (for [connection individual-connections]
         {:column_name "case_study"
          :topic "case_study"
          :topic_id resource-id
          :stakeholder (:stakeholder connection)
          :association (:role connection)
          :remarks nil})))

(defn- create-case-study
  [{:keys [logger mailjet-config] :as config} conn {:keys [body]}]
  (let [{:keys [geo_coverage_countries geo_coverage_country_groups geo_coverage_country_states
                tags geo_coverage_type individual_connections entity_connections related_content
                image thumbnail created_by]} body
        case-study (apply dissoc body dom.case-study/entity-relation-keys)
        image-url (handler.image/assoc-image config conn image "case_study")
        thumbnail-url (handler.image/assoc-image config conn thumbnail "case_study")
        api-individual-connections (handler.util/individual-connections->api-individual-connections
                                    conn
                                    individual_connections
                                    created_by)
        owners (map :stakeholder (filter #(= (:role %) "owner") individual_connections))
        db-case-study (-> case-study
                          (assoc :image image-url :thumbnail thumbnail-url)
                          db.case-study/case-study->db-case-study)
        insert-cols (sql-util/get-insert-columns-from-entity-col [db-case-study])
        insert-values (sql-util/entity-col->persistence-entity-col [db-case-study])
        cs-creation-result (db.case-study/create-case-studies
                            conn
                            {:insert-cols insert-cols
                             :insert-values insert-values})
        cs-id (-> cs-creation-result first :id)]
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags
       conn
       logger
       mailjet-config
       {:tags tags
        :tag-category "general"
        :resource-name "case_study"
        :resource-id cs-id}))
    (handle-geo-coverage conn
                         cs-id
                         (keyword geo_coverage_type)
                         geo_coverage_countries
                         geo_coverage_country_groups
                         geo_coverage_country_states)
    (when (seq related_content)
      (handle-related-content conn logger cs-id related_content))
    (doseq [stakeholder-id owners]
      (h.auth/grant-topic-to-stakeholder! conn {:topic-id cs-id
                                                :topic-type "case_study"
                                                :stakeholder-id stakeholder-id
                                                :roles ["owner"]}))
    (when (not-empty entity_connections)
      (doseq [association (expand-entity-associations entity_connections cs-id)]
        (db.favorite/new-organisation-association conn association)))
    (when (not-empty api-individual-connections)
      (doseq [association (expand-individual-associations api-individual-connections cs-id)]
        (db.favorite/new-stakeholder-association conn association)))
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge case-study {:type "case_study"}))
    cs-id))

(defmethod ig/init-key :gpml.handler.case-study/post
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [jwt-claims parameters]}]
    (try
      (let [stakeholder (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)]
        (if-not (seq stakeholder)
          (r/server-error {:success? false
                           :reason :failed-to-get-stakeholder})
          (jdbc/with-db-transaction [tx (:spec db)]
            (let [cs-id (create-case-study
                         config
                         tx
                         (assoc-in parameters [:body :created_by] (:id stakeholder)))]
              (r/ok {:success? true
                     :id cs-id})))))
      (catch Exception e
        (log logger :error ::failed-to-create-case-study {:exception-message (.getMessage e)})
        (let [response {:success? false
                        :reason :could-not-create-case-study}]

          (if (instance? SQLException e)
            (r/server-error response)
            (r/server-error (assoc-in response [:error-details :error] (.getMessage e)))))))))

(defmethod ig/init-key :gpml.handler.case-study/post-params
  [_ _]
  {:body (-> dom.case-study/CaseStudy
             (util.malli/dissoc
              [:id :created_by :created :last_modified_at :reviewed_at :reviewed_by :review_status]))})

(defmethod ig/init-key :gpml.handler.case-study/post-responses
  [_ _]
  (let [case-study-id-properties {:swagger
                                  {:description "The newly created Case Study's identifier."
                                   :type "integer"}}
        ok-response-schema-update-fn #(mu/update-properties % (constantly case-study-id-properties))]
    {200 {:body (-> handler.util/default-ok-response-body-schema
                    (mu/assoc :id pos-int?)
                    (mu/update-in [:id] ok-response-schema-update-fn))}
     500 {:body handler.util/default-error-response-body-schema}}))
