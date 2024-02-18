(ns gpml.handler.stakeholder-association
  (:require
   [clojure.java.jdbc :as jdbc]
   [gpml.db.favorite :as db.favorite]
   [gpml.db.stakeholder-association :as db.stakeholder-association]
   [gpml.domain.resource :as dom.resource]
   [gpml.handler.resource.permission :as h.r.permission]
   [gpml.handler.responses :as r]
   [gpml.util :as util]
   [integrant.core :as ig]
   [ring.util.response :as resp]))

(def associations
  #{"owner" "implementor" "partner" "donor" "interested in"})

(defn- api-associated-topics-opts->associated-topics-opts [api-associated-topics-opts]
  (-> api-associated-topics-opts
      (util/update-if-not-nil :page #(Integer/parseInt %))
      (util/update-if-not-nil :limit #(Integer/parseInt %))))

(defn- associated-topics->api-associated-topics [associated-topics]
  (-> (:json associated-topics)
      (merge (select-keys associated-topics [:stakeholder_connections :entity_connections]))
      (assoc :type (:topic associated-topics))))

(defmethod ig/init-key :gpml.handler.stakeholder-association/get-associated-topics
  [_ {:keys [db] :as config}]
  (fn [{:keys [parameters user]}]
    (if (h.r.permission/operation-allowed?
         config
         {:user-id (:id user)
          :entity-type :application
          :custom-permission :read-suggested-profiles
          :root-context? true})
      (let [{:keys [association limit page]} (api-associated-topics-opts->associated-topics-opts (:query parameters))
            common-params {:stakeholder-id (-> parameters :path :id)
                           :association association}
            associated-topics
            (db.stakeholder-association/get-stakeholder-associated-topics (:spec db)
                                                                          (merge common-params
                                                                                 {:limit limit
                                                                                  :offset (* limit page)}))
            associated-topics-count
            (db.stakeholder-association/get-stakeholder-associated-topics (:spec db)
                                                                          (merge common-params {:count-only? true}))]
        (resp/response
         {:success? true
          :associated_topics (map associated-topics->api-associated-topics associated-topics)
          :count (-> associated-topics-count first :count)}))
      (r/forbidden {:message "Unauthorized"}))))

;; FIXME: These defaults for both `page` and `limit` params are not working. The endpoint crashes without them.
(defmethod ig/init-key :gpml.handler.stakeholder-association/get-associated-topics-params
  [_ _]
  {:path [:map [:id pos-int?]]
   :query [:map
           [:page {:optional true
                   :default "0"}
            string?]
           [:limit {:optional true
                    :default "3"}
            string?]
           [:association
            (apply conj [:enum] associations)]]})

(defn- stakeholder-type->api-stakeholder-type [stakeholder-type]
  (case stakeholder-type
    "individual" "stakeholder"
    "entity" "organisation"))

(defn- topic-type->api-topic-type [topic-type]
  (cond
    (contains? dom.resource/types topic-type) "resource"
    :else topic-type))

(defmethod ig/init-key :gpml.handler.stakeholder-association/delete
  [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters}]
    (let [conn (:spec db)
          stakeholder-type (stakeholder-type->api-stakeholder-type (:stakeholder-type path))
          topic (topic-type->api-topic-type (:topic-type path))
          connection-id (:connection-id path)
          params {:id connection-id
                  :topic (str stakeholder-type "_" topic)}]
      (resp/response (resp/response (do
                                      (jdbc/with-db-transaction [tx-conn conn]
                                        (db.favorite/delete-stakeholder-association tx-conn params))
                                      {:deleted params}))))))

(defmethod ig/init-key :gpml.handler.stakeholder-association/put
  [_ {:keys [db]}]
  (fn [{{{:keys [stakeholder-type topic-type connection-id]} :path body :body} :parameters}]
    (let [conn (:spec db)
          stakeholder-type (stakeholder-type->api-stakeholder-type stakeholder-type)
          topic (topic-type->api-topic-type topic-type)
          table (str stakeholder-type "_" topic)
          params {:updates body :id connection-id :table table :topic topic}
          status (db.favorite/update-stakeholder-association conn params)]
      (resp/response {:status status
                      :updated {:id connection-id
                                :table table}}))))

(defmethod ig/init-key :gpml.handler.stakeholder-association/put-params
  [_ _]
  [:map
   [:stakeholder {:optional true} int?]
   [:organisation {:optional true} int?]
   [:association {:optional true} string?]
   [:remarks {:optional true} string?]])
