(ns gpml.handler.review
  (:require
   [clojure.string :as str]
   [clojure.java.jdbc :as jdbc]
   [gpml.constants :as constants]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.db.review :as db.review]
   [integrant.core :as ig]
   [ring.util.response :as resp]))

(def review-status-re (->> constants/reviewer-review-status
                           (map symbol)
                           (str/join "|")
                           (format "^(%1$s)((,(%1$s))+)?$")
                           re-pattern))

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

(defn new-review [db topic-type topic-id reviewer assigned-by]
  (let [topic-type (get-internal-topic-type topic-type)
        resp409 {:status 409 :body {:message "Review already created for this resource"}}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (if-let [_ (db.review/review-by-topic-item
                   conn
                   {:topic-type topic-type :topic-id topic-id})]
         resp409
         (resp/response
          (db.review/new-review conn {:topic-type topic-type
                                      :topic-id topic-id
                                      :assigned-by assigned-by
                                      :reviewer reviewer}))))))

(defn change-reviewer [db topic-type topic-id reviewer admin]
  (let [topic-type (get-internal-topic-type topic-type)
        assigned-by (:id admin)
        is-admin (= "ADMIN" (:role admin))
        resp403 {:status 403 :body {:message "Cannot update reviewer for this topic"}}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (if-let [review (and is-admin
                            (db.review/review-by-topic-item
                             conn
                             {:topic-type topic-type :topic-id topic-id}))]
         (resp/response
          (db.review/change-reviewer conn {:id (:id review)
                                           :assigned-by assigned-by
                                           :reviewer reviewer}))
         resp403))))

(defn update-review-status [db topic-type topic-id review-status review-comment reviewer]
  (let [topic-type (get-internal-topic-type topic-type)
        resp403 {:status 403 :body {:message "Cannot update review for this topic"}}]
    (jdbc/with-db-transaction [conn (:spec db)]
      (if-let [review (db.review/review-by-topic-item
                       conn
                       {:topic-type topic-type :topic-id topic-id})]
        ;; If assigned to the current-user
        (if (= (:reviewer review) (:id reviewer))
          (resp/response (db.review/update-review-status
                          conn
                          {:id (:id review)
                           :review-status review-status
                           :review-comment review-comment}))
          resp403)
        resp403))))

(defn list-reviews [db reviewer page limit status]
  (let [conn (:spec db)
        review-status (and status (str/split status #","))
        params {:reviewer (:id reviewer) :page page :limit limit :review-status review-status}
        reviews (db.review/reviews-by-reviewer-id conn params)
        count (:count (db.review/count-by-reviewer-id conn params))
        pages (int (Math/ceil (float (/ count (or (and (> limit 0) limit) 1)))))]
    (resp/response {:reviews reviews :page page :limit limit :pages pages :count count})))

(defmethod ig/init-key ::get-reviewers [_ {:keys [db]}]
  (fn [_]
    (get-reviewers db)))

(defmethod ig/init-key ::get-review [_ {:keys [db]}]
  (fn [{{{:keys [topic-type topic-id]} :path} :parameters}]
    (get-review db topic-type topic-id)))

(defmethod ig/init-key ::new-review [_ {:keys [db]}]
  (fn [{{{:keys [topic-type topic-id]} :path
         {:keys [reviewer]} :body} :parameters
        admin :admin}]
    (new-review db topic-type topic-id reviewer (:id admin))))

(defmethod ig/init-key ::update-review [_ {:keys [db]}]
  (fn [{{{:keys [topic-type topic-id]} :path
         {:keys [review-status review-comment reviewer]} :body} :parameters
        current-user :reviewer}]
    (if reviewer
      (change-reviewer db topic-type topic-id reviewer current-user)
      (update-review-status db topic-type topic-id review-status review-comment current-user))))

(defmethod ig/init-key ::list-reviews [_ {:keys [db]}]
  (fn [{{{:keys [page limit review-status]} :query} :parameters
        reviewer :reviewer}]
    (list-reviews db reviewer page limit review-status)))

(defmethod ig/init-key ::review-status [_ _]
  (apply conj [:enum] constants/reviewer-review-status))

(defmethod ig/init-key ::list-reviews-params [_ _]
  {:query [:map
           [:page {:optional true
                   :default 1}
            int?]
           [:limit {:optional true
                    :default 10}
            int?]
           [:review-status {:optional true}
            [:re review-status-re]]]})
