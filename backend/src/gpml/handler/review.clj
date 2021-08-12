(ns gpml.handler.review
  (:require
   [clojure.java.jdbc :as jdbc]
   [gpml.constants :as constants]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.db.review :as db.review]
   [integrant.core :as ig]
   [ring.util.response :as resp]))

(defn get-reviewers [db]
  (let [conn (:spec db)]
    (resp/response (db.stakeholder/get-reviewers conn))))

(defn get-review [db topic-type topic-id]
  (let [conn (:spec db)
        topic-name (cond
                     (contains? (set constants/resource-types) topic-type) "resource"
                     (= topic-type "project") "initiative"
                     :else topic-type)
        review (db.review/review-by-topic-item
                conn
                {:topic-name topic-name :topic-id topic-id})]
    (resp/response review)))

(defn assign-reviewer [db topic-type topic-id reviewer assigned-by]
  (let [topic-name (cond
                     (contains? (set constants/resource-types) topic-type) "resource"
                     (= topic-type "project") "initiative"
                     :else topic-type)]
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [existing (db.review/review-by-topic-item
                      conn
                      {:topic-name topic-name :topic-id topic-id})
            review-id (:id existing)
            updated (if (nil? review-id)
                      (db.review/new-review conn {:topic-name topic-name
                                                  :topic-id topic-id
                                                  :assigned-by assigned-by
                                                  :reviewer reviewer})
                      (db.review/change-reviewer conn {:id review-id
                                                       :assigned-by assigned-by
                                                       :reviewer reviewer}))]
        (resp/response updated)))))

(defmethod ig/init-key ::get-reviewers [_ {:keys [db]}]
  (fn [_]
    (get-reviewers db)))

(defmethod ig/init-key ::get-review [_ {:keys [db]}]
  (fn [{{{:keys [topic-type topic-id]} :path} :parameters}]
    (get-review db topic-type topic-id)))

(defmethod ig/init-key ::assign-reviewer [_ {:keys [db]}]
  (fn [{{{:keys [topic-type topic-id]} :path {:keys [assigned-by reviewer]} :body} :parameters}]
    (assign-reviewer db topic-type topic-id reviewer assigned-by)))
