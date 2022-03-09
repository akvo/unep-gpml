(ns gpml.handler.stakeholder-association
  (:require [gpml.db.stakeholder-association :as db.stakeholder-association]
            [integrant.core :as ig]
            [ring.util.response :as resp]
            [gpml.db.favorite :as db.favorite]
            [gpml.constants :as constants]
            [clojure.java.jdbc :as jdbc]))

(def ^:const associations
  #{"owner" "implementor" "partner" "donor" "interested in"})

(def topics
  (apply conj [:enum] constants/topics))

(defmethod ig/init-key ::types [_ _]
  (apply conj [:enum] constants/stakeholder-types))

;; TODO: use update-if-exists instead of update
(defn api-associated-topics-opts->associated-topics-opts
  [api-associated-topics-opts]
  (-> api-associated-topics-opts
      (update :page #(Integer/parseInt %))
      (update :limit #(Integer/parseInt %))))

(defmethod ig/init-key ::get-associated-topics
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
        {:associated_topics (map #(merge (:json %)
                                    (select-keys % [:stakeholder_connections :entity_connections]))
                              associated-topics)
         :count (-> associated-topics-count first :count)}))))

(defmethod ig/init-key ::get-associated-topics-params [_ _]
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

(defmethod ig/init-key ::delete [_ {:keys [db]}]
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

(defn expand-entity-associations
  [entity-connections topic topic-id]
  (vec (for [connection entity-connections]
         (let [{:keys [id entity role]} connection]
           (if (pos-int? id)
             {:id id
              :table (str "organisation_" topic)
              :topic topic
              :updates {(keyword topic) topic-id
                        :association role
                        :organisation entity}}
             {:column_name topic
              :topic topic
              :topic_id topic-id
              :organisation entity
              :association role
              :remarks nil})))))

(defn expand-individual-associations
  [individual-connections topic topic-id]
  (vec (for [connection individual-connections]
         (let [{:keys [id stakeholder role]} connection]
           (if (pos-int? id)
             {:id id
              :table (str "stakeholder_" topic)
              :topic topic
              :updates {(keyword topic) topic-id
                        :association role
                        :stakeholder stakeholder}}
             {:column_name topic
              :topic topic
              :topic_id topic-id
              :stakeholder stakeholder
              :association role
              :remarks nil})))))

(defmethod ig/init-key ::post [_ {:keys [db]}]
  (fn [{{{:keys [topic-type topic-id]} :path {:keys [individual_connections entity_connections]} :body} :parameters}]
    (let [conn (:spec db)
          topic (topic-type->api-topic-type topic-type)
          stakeholder-status (if (not-empty individual_connections)
                               (doseq [association (expand-individual-associations individual_connections topic topic-id)]
                                 (if (contains? association :id)
                                   (db.favorite/update-stakeholder-association conn association)
                                   (db.favorite/new-association conn association)))
                               1)
          entity-status (if (not-empty entity_connections)
                          (doseq [association (expand-entity-associations entity_connections topic topic-id)]
                            (if (contains? association :id)
                              (db.favorite/update-stakeholder-association conn association)
                              (db.favorite/new-organisation-association conn association)))
                          1)]
      (resp/response {:status (if (and (every? #(= % 1) entity-status)(every? #(= % 1) stakeholder-status))
                                1 0)}))))

(defmethod ig/init-key ::post-params [_ _]
  [:map
   [:entity_connections {:optional true}
    [:vector {:optional true}
     [:map
      [:id {:optional true} int?]
      [:entity int?]
      [:role
       [:enum "owner" "implementor" "partner" "donor"]]]]]
   [:individual_connections {:optional true}
    [:vector {:optional true}
     [:map
      [:id {:optional true} int?]
      [:stakeholder int?]
      [:role
       [:enum "owner" "resource_editor"]]]]]])
