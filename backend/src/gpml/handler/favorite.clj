(ns gpml.handler.favorite
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.data :as dt]
            [clojure.string :as string]
            [clojure.set :as set]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def associations
  {:resource #{"owner" "reviewer" "user" "interested in" "other"}
   :technology #{"owner" "user" "reviewer" "interested in" "other"}
   :event #{"resource person" "organiser" "participant" "sponsor" "host" "interested in" "other"}
   :project #{"owner" "implementor" "reviewer" "user" "interested in" "other"}
   :policy #{"regulator" "implementor" "reviewer" "interested in" "other"}
   :organisation #{"interested in" "other"}
   :stakeholder #{"interested in" "other"}})

(def post-params
  [:and
   [:map
    [:topic [:enum "event" "technology" "policy" "resource" "project" "organisation" "stakeholder"]]
    [:topic_id int?]
    [:association [:vector string?]]]
   [:fn {:error/fn (fn [{{:keys [topic]} :value} _]
                      (let [topic-associations ((keyword topic) associations)
                            associations-text (string/join ", " topic-associations)]
                        (format "%s only supports '%s' associations" topic associations-text)))}
     (fn [{:keys [topic association]}]
       (set/superset? ((keyword topic) associations) association))]])

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

(defn expand-associations
  [{:keys [topic topic_id association]}]
  (vec (for [a association]
         {:topic topic
          :column_name (or (and (= "stakeholder" topic) "other_stakeholder") topic)
          :topic_id topic_id
          :association a})))

(defmethod ig/init-key ::post [_ {:keys [db]}]
  (fn [{:keys [jwt-claims body-params]}]
    (if-let [stakeholder (get-stakeholder-id (:spec db) (:email jwt-claims))]
      (let [db (:spec db)
            new-topic (assoc body-params :stakeholder stakeholder)
            attr {:column_name
                  (if (= (:topic body-params) "stakeholder")
                    "other_stakeholder"
                    (:topic body-params))
                  :topic (str "stakeholder_" (:topic body-params))}
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
        (resp/response {:message "OK"}))
      (resp/bad-request {:message (format "User with email %s does not exist" (:email jwt-claims))}))))

(defmethod ig/init-key ::post-params [_ _]
  post-params)
