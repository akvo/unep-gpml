(ns gpml.handler.stakeholder-association
  (:require [clojure.java.jdbc :as jdbc]
            [gpml.constants :as constants]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.stakeholder-association :as db.stakeholder-association]
            [gpml.util :as util]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def ^:const associations
  #{"owner" "implementor" "partner" "donor" "interested in"})

(defmethod ig/init-key ::types [_ _]
  (apply conj [:enum] constants/stakeholder-types))

(defn- api-associated-topics-opts->associated-topics-opts
  [api-associated-topics-opts]
  (-> api-associated-topics-opts
      (util/update-if-not-nil :page #(Integer/parseInt %))
      (util/update-if-not-nil :limit #(Integer/parseInt %))))

(defn- associated-topics->api-associated-topics
  [associated-topics]
  (-> (:json associated-topics)
      (merge (select-keys associated-topics [:stakeholder_connections :entity_connections]))
      (assoc :type (:topic associated-topics))))

(defmethod ig/init-key :gpml.handler.stakeholder-association/get-associated-topics
  [_ {:keys [db]}]
  (fn [{:keys [parameters]}]
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
        :count (-> associated-topics-count first :count)}))))

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
    (contains? constants/resource-types topic-type) "resource"
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
