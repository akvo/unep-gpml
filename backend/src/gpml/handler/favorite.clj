(ns gpml.handler.favorite
  (:require [clojure.data :as dt]
            [clojure.java.jdbc :as jdbc]
            [clojure.set :as set]
            [clojure.string :as string]
            [gpml.db.activity :as db.activity]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.util :as util]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def associations
  {:resource #{"owner" "reviewer" "user" "interested in" "other"}
   :technology #{"owner" "user" "reviewer" "interested in" "other"}
   :event #{"resource person" "organiser" "participant" "sponsor" "host" "interested in" "other"}
   :initiative #{"owner" "implementor" "reviewer" "user" "interested in" "other"}
   :project #{"owner" "implementor" "reviewer" "user" "interested in" "other"}
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

(defn get-favorites
  [db id]
  (let [data (db.favorite/association-by-stakeholder db {:stakeholder id})]
    (reduce (fn [acc [[topic_id topic] v]]
              (conj acc {:topic_id topic_id
                         :topic topic
                         :association (mapv :association v)}))
            []
            (group-by (juxt :id :topic) data))))

(defmethod ig/init-key ::get [_ {:keys [db]}]
  (fn [{{:keys [email]} :jwt-claims}]
    (if-let [stakeholder (get-stakeholder-id (:spec db) email)]
      (resp/response (get-favorites (:spec db) stakeholder))
      (resp/bad-request {:message (format "User with email %s does not exist" email)}))))

(defn topic->api-topic [topic]
  (if (= "project" topic)
    "initiative"
    topic))

(defn topic->column-name [topic]
  (if (= "stakeholder" topic)
    "other_stakeholder"
    topic))

(defn expand-associations
  [{:keys [topic topic_id association]}]
  (vec (for [a association]
         (let [topic (topic->api-topic topic)
               column-name (topic->column-name topic)]
           {:topic topic
            :column_name column-name
            :topic_id topic_id
            :association a}))))

(defmethod ig/init-key ::post [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params]}]
    (if-let [stakeholder (get-stakeholder-id (:spec db) (:email jwt-claims))]
      (let [db (:spec db)
            new-topic (assoc body-params :stakeholder stakeholder)
            topic (topic->api-topic (:topic body-params))
            column-name (topic->column-name topic)
            attr {:column_name column-name
                  :topic (str "stakeholder_" topic)}
            current (merge new-topic attr)
            current (db.favorite/association-by-stakeholder-topic db current)
            delete (first
                    (dt/diff
                     (set (map #(:association %) current))
                     (set (:association body-params))))
            delete (first delete)]
        (when (some? delete)
          (let [delete (-> (filter #(= (:association %) delete) current)
                           first
                           (merge attr))]
            (tap> (:id delete))
            (db.favorite/delete-stakeholder-association db delete)))
        (jdbc/with-db-transaction [conn db]
          (doseq [association (expand-associations body-params)]
            (db.favorite/new-association conn (merge
                                               {:stakeholder stakeholder
                                                :remarks nil}
                                               association))))
        (db.activity/create-activity db {:id (util/uuid)
                                         :type "bookmark_resource"
                                         :owner_id stakeholder
                                         :metadata (select-keys body-params [:topic :topic_id])})
        (resp/response {:message "OK"}))
      (resp/bad-request {:message (format "User with email %s does not exist" (:email jwt-claims))}))))

(defmethod ig/init-key ::post-params [_ _]
  post-params)
