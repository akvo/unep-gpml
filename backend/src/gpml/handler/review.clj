(ns gpml.handler.review
  (:require
   [clojure.java.jdbc :as jdbc]
   [gpml.constants :as constants]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.db.review :as db.review]
   [integrant.core :as ig]
   [ring.util.response :as resp]))

(defn- get-internal-topic-type [topic-type]
  (cond
    (contains? constants/resource-types topic-type) "resource"
    (= topic-type "project") "initiative"
    :else topic-type))

(defn get-reviewers [db]
  (let [conn (:spec db)]
    (resp/response (db.stakeholder/get-reviewers conn))))

(defn get-review [db topic-type topic-id]
  (let [conn (:spec db)
        topic-type (get-internal-topic-type topic-type)
        review (db.review/review-by-topic-item
                conn
                {:topic-type topic-type :topic-id topic-id})]
    (resp/response review)))

(defn assign-reviewer [db topic-type topic-id reviewer assigned-by]
  (let [topic-type (get-internal-topic-type topic-type)]
    (jdbc/with-db-transaction [conn (:spec db)]
      (resp/response
       (if-let [review (db.review/review-by-topic-item
                        conn
                        {:topic-type topic-type :topic-id topic-id})]
         (db.review/change-reviewer conn {:id (:id review)
                                          :assigned-by assigned-by
                                          :reviewer reviewer})
         (db.review/new-review conn {:topic-type topic-type
                                     :topic-id topic-id
                                     :assigned-by assigned-by
                                     :reviewer reviewer}))))))

(defn update-review [db topic-type topic-id review-status review-comment email]
  (let [topic-type (get-internal-topic-type topic-type)
        current-user (db.stakeholder/stakeholder-by-email (:spec db) {:email email})
        resp403 {:status 403 :body {:message "Cannot update review for this topic"}}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (if-let [review (db.review/review-by-topic-item
                      conn
                      {:topic-type topic-type :topic-id topic-id})]
        ;; If assigned to the current-user
        (if (= (:reviewer review) (:id current-user))
          (resp/response (db.review/update-review
                          conn
                          {:id (:id review)
                           :review-status review-status
                           :review-comment review-comment}))
          resp403)
        resp403))))

(defmethod ig/init-key ::get-reviewers [_ {:keys [db]}]
  (fn [_]
    (get-reviewers db)))

(defmethod ig/init-key ::get-review [_ {:keys [db]}]
  (fn [{{{:keys [topic-type topic-id]} :path} :parameters}]
    (get-review db topic-type topic-id)))

(defmethod ig/init-key ::assign-reviewer [_ {:keys [db]}]
  (fn [{{{:keys [topic-type topic-id]} :path
         {:keys [assigned-by reviewer]} :body} :parameters}]
    (assign-reviewer db topic-type topic-id reviewer assigned-by)))

(defmethod ig/init-key ::update-review [_ {:keys [db]}]
  (fn [{{{:keys [topic-type topic-id]} :path
         {:keys [review-status review-comment]} :body} :parameters
        {:keys [email]} :jwt-claims}]
    (update-review db topic-type topic-id review-status review-comment email)))

(defmethod ig/init-key ::review-status [_ _]
  (apply conj [:enum] constants/reviewer-review-status))
