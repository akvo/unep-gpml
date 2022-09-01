(ns gpml.handler.favorite
  (:require [clojure.data :as dt]
            [clojure.java.jdbc :as jdbc]
            [clojure.set :as set]
            [clojure.string :as string]
            [duct.logger :refer [log]]
            [gpml.db.activity :as db.activity]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.handler.responses :as r]
            [gpml.handler.util :as api-util]
            [gpml.util :as util]
            [gpml.util.postgresql :as pg-util]
            [integrant.core :as ig]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

;; FIXME: refactor favorite logic. It's entangled with follower and permissions.

(def associations
  {:resource #{"owner" "reviewer" "user" "interested in" "other"}
   :technology #{"owner" "user" "reviewer" "interested in" "other"}
   :event #{"resource person" "organiser" "participant" "sponsor" "host" "interested in" "other"}
   :initiative #{"owner" "implementor" "reviewer" "user" "interested in" "other"}
   :policy #{"regulator" "implementor" "reviewer" "interested in" "other"}
   :organisation #{"interested in" "other"}
   :stakeholder #{"interested in" "other"}})

(def post-params
  [:and
   [:map
    [:topic (apply conj [:enum] (->> associations keys (map name)))]
    [:topic_id int?]
    [:association [:vector string?]]]
   [:fn {:error/fn (fn [{{:keys [topic]} :value} _]
                     (let [topic-associations ((keyword topic) associations)
                           associations-text (string/join ", " topic-associations)]
                       (format "%s only supports '%s' associations" topic associations-text)))}
    (fn [{:keys [topic association]}]
      (or
       ;; NOTE: We return true when topic is not a valid one, to
       ;; prevent trying to run the custom error message function. The
       ;; validation on the topic enum is returned anyway.
       (not (contains? associations (keyword topic)))
       (set/superset? ((keyword topic) associations) association)))]])

(defn- get-stakeholder-id
  [db email]
  (:id (db.stakeholder/approved-stakeholder-by-email db {:email email})))

(defn- get-favorites
  [db stakeholder topic-type topic-id]
  (let [topic (api-util/get-internal-topic-type topic-type)
        data (db.favorite/association-by-stakeholder-topic db {:stakeholder-id stakeholder
                                                               :resource-col topic
                                                               :table (str "stakeholder_" topic)
                                                               :resource-id topic-id})]
    (reduce (fn [acc [[topic_id topic] v]]
              (conj acc {:topic_id topic_id
                         :topic topic
                         :association (mapv :association v)}))
            []
            (group-by (juxt :id (constantly topic-type)) data))))

(defmethod ig/init-key :gpml.handler.favorite/get [_ {:keys [db]}]
  (fn [{{:keys [email]} :jwt-claims {{:keys [topic-type topic-id]} :path} :parameters}]
    (if-let [stakeholder (get-stakeholder-id (:spec db) email)]
      (resp/response (get-favorites (:spec db) stakeholder topic-type topic-id))
      (resp/bad-request {:message (format "User with email %s does not exist" email)}))))

(defn- topic->column-name [topic]
  (if (= "stakeholder" topic)
    "other_stakeholder"
    topic))

(defn- expand-associations
  [{:keys [topic topic_id association]}]
  (vec (for [a association]
         (let [column-name (topic->column-name topic)]
           {:topic topic
            :column_name column-name
            :topic_id topic_id
            :association a}))))

(defmethod ig/init-key :gpml.handler.favorite/post
  [_ {:keys [logger db]}]
  (fn [{:keys [user body-params]}]
    (try
      (let [db (:spec db)
            {resource-id :topic_id resource-type :topic} body-params
            resource-col (topic->column-name resource-type)
            current (db.favorite/association-by-stakeholder-topic db {:stakeholder-id (:id user)
                                                                      :resource-col resource-col
                                                                      :table (str "stakeholder_" resource-type)
                                                                      :resource-id resource-id})
            delete (first
                    (dt/diff
                     (set (map #(:association %) current))
                     (set (:association body-params))))
            delete (first delete)]
        (jdbc/with-db-transaction [conn db]
          (when (some? delete)
            (let [delete (-> (filter #(= (:association %) delete) current)
                             first
                             (merge {:topic (str "stakeholder_" resource-type)}))]
              (db.favorite/delete-stakeholder-association conn delete)))
          (doseq [association (expand-associations body-params)]
            (prn (db.favorite/new-stakeholder-association conn (merge
                                                                {:stakeholder (:id user)
                                                                 :remarks nil}
                                                                association)))))
        (db.activity/create-activity db {:id (util/uuid)
                                         :type "bookmark_resource"
                                         :owner_id (:id user)
                                         :metadata (select-keys body-params [:topic :topic_id])})
        (r/ok {:success? true
               :message "OK"}))
      (catch Exception e
        (log logger :error ::failed-to-create-association {:exception-message (.getMessage e)})
        (r/server-error {:success? false
                         :reason :failed-to-create-association
                         :error-details {:error (if (instance? SQLException e)
                                                  (pg-util/get-sql-state e)
                                                  (.getMessage e))}})))))

(defmethod ig/init-key ::post-params [_ _]
  post-params)
