(ns gpml.handler.case-study
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.set :as set]
   [duct.logger :refer [log]]
   [gpml.db.case-study :as db.case-study]
   [gpml.domain.case-study :as dom.case-study]
   [gpml.handler.file :as handler.file]
   [gpml.handler.resource.geo-coverage :as handler.geo]
   [gpml.handler.resource.permission :as h.r.permission]
   [gpml.handler.resource.related-content :as handler.resource.related-content]
   [gpml.handler.resource.tag :as handler.resource.tag]
   [gpml.handler.responses :as r]
   [gpml.handler.util :as handler.util]
   [gpml.service.association :as srv.association]
   [gpml.service.permissions :as srv.permissions]
   [gpml.util.email :as email]
   [gpml.util.malli :as util.malli]
   [gpml.util.sql :as sql-util]
   [integrant.core :as ig]
   [malli.util :as mu])
  (:import
   (java.sql SQLException)))

(defn- handle-geo-coverage [conn cs-id geo-coverage-type geo-coverage-countries geo-coverage-country-groups geo-coverage-country-states]
  (let [result (handler.geo/create-resource-geo-coverage conn
                                                         :case_study
                                                         cs-id
                                                         geo-coverage-type
                                                         {:countries geo-coverage-countries
                                                          :country-groups geo-coverage-country-groups
                                                          :country-states geo-coverage-country-states})]
    (when-not (:success? result)
      (throw (ex-info "Failed to create case study's geo coverage" result)))))

(defn- handle-related-content [conn logger cs-id related_content]
  (when-not (:success? (handler.resource.related-content/create-related-contents
                        conn
                        logger
                        cs-id
                        "case_study"
                        related_content))
    (throw (ex-info "Failed to create case study's related content" {}))))

(defn- create-case-study [{:keys [logger mailjet-config] :as config}
                          conn
                          user
                          {:keys [body]}]
  (let [{:keys [geo_coverage_countries geo_coverage_country_groups geo_coverage_country_states
                tags geo_coverage_type individual_connections entity_connections related_content
                image thumbnail created_by]} body
        case-study (apply dissoc body dom.case-study/entity-relation-keys)
        image-id (when (seq image)
                   (handler.file/create-file config conn image :case_study :images :public))
        thumbnail-id (when (seq thumbnail)
                       (handler.file/create-file config conn thumbnail :case_study :images :public))
        api-individual-connections (handler.util/individual-connections->api-individual-connections
                                    conn
                                    individual_connections
                                    created_by)
        db-case-study (-> case-study
                          (assoc :image_id image-id :thumbnail_id thumbnail-id)
                          (dissoc :image :thumbnail)
                          db.case-study/case-study->db-case-study)
        insert-cols (sql-util/get-insert-columns-from-entity-col [db-case-study])
        insert-values (sql-util/entity-col->persistence-entity-col [db-case-study])
        cs-creation-result (db.case-study/create-case-studies
                            conn
                            {:insert-cols insert-cols
                             :insert-values insert-values})
        cs-id (-> cs-creation-result first :id)
        org-associations (map #(set/rename-keys % {:entity :organisation}) entity_connections)]
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
    (srv.permissions/create-resource-context
     {:conn conn
      :logger logger}
     {:context-type :case-study
      :resource-id cs-id})
    (srv.association/save-associations
     {:conn conn
      :logger logger}
     {:org-associations org-associations
      :sth-associations (if (seq api-individual-connections)
                          api-individual-connections
                          [{:role "owner"
                            :stakeholder (:id user)}])
      :resource-type "case-study"
      :resource-id cs-id})
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge case-study {:type "case_study"}))
    cs-id))

(defmethod ig/init-key :gpml.handler.case-study/post
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [parameters user]}]
    (try
      (if (h.r.permission/operation-allowed?
           config
           {:user-id (:id user)
            :entity-type :case-study
            :operation-type :create
            :root-context? true})
        (jdbc/with-db-transaction [tx (:spec db)]
          (let [cs-id (create-case-study
                       config
                       tx
                       user
                       (assoc-in parameters [:body :created_by] (:id user)))]
            (r/ok {:success? true
                   :id cs-id})))
        (r/forbidden {:message "Unauthorized"}))
      (catch Exception e
        (log logger :error :failed-to-create-case-study e)
        (let [response {:success? false
                        :reason :could-not-create-case-study}]

          (if (instance? SQLException e)
            (r/server-error response)
            (r/server-error (assoc-in response [:error-details :error] (.getMessage e)))))))))

(defmethod ig/init-key :gpml.handler.case-study/post-params
  [_ _]
  {:body [:and
          (-> dom.case-study/CaseStudy
              (util.malli/dissoc
               [:id :created_by :created :last_modified_at :reviewed_at :reviewed_by :review_status]))
          handler.geo/api-geo-coverage-validator-schema]})

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
