(ns gpml.handler.review
  (:require
   [clojure.string :as str]
   [clojure.set :as set]
   [clojure.java.jdbc :as jdbc]
   [gpml.constants :as constants]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.email-util :as email]
   [gpml.db.review :as db.review]
   [gpml.handler.util :as util]
   [integrant.core :as ig]
   [ring.util.response :as resp]))

(defn reviews-by-reviewer-id [conn opts]
  (map (fn [{:keys [details] :as review}]
         (let [[title picture] details]
           (-> review
               (assoc :title title)
               (assoc :picture picture)
               (dissoc :details))))
       (db.review/reviews-by-reviewer-id conn opts)))

(def review-status-re (->> constants/reviewer-review-status
                           (map symbol)
                           (str/join "|")
                           (format "^(%1$s)((,(%1$s))+)?$")
                           re-pattern))

(defn get-reviewers [db]
  (let [conn (:spec db)]
    (resp/response (db.stakeholder/get-reviewers conn))))

(defn new-review* [{:keys [conn mailjet-config topic-type topic-id assigned-by]} c reviewer-id]
  (let [params {:topic-type topic-type
                :topic-id topic-id
                :assigned-by assigned-by
                :reviewer reviewer-id}
        reviewer (db.stakeholder/stakeholder-by-id conn {:id reviewer-id})
        reviewer-name (email/get-user-full-name reviewer)
        new-review (db.review/new-review conn params)
        review (db.review/review-by-id conn new-review)]
    (email/send-email mailjet-config
                      email/unep-sender
                      (format "[%s] Review requested on new %s" (:app-name mailjet-config) topic-type)
                      (list {:Name reviewer-name :Email (:email reviewer)})
                      (list (email/notify-reviewer-pending-review-text reviewer-name (:app-domain mailjet-config) topic-type (:title review)))
                      (list nil))
    (conj c review)))

(defn new-multiple-review [db mailjet-config topic-type topic-id reviewers assigned-by]
  (let [topic-type* (util/get-internal-topic-type topic-type)]
    (jdbc/with-db-transaction [conn (:spec db)]
      (db.review/delete-reviews conn {:topic-type topic-type* :topic-id topic-id})
      (resp/response {:reviews (reduce (partial new-review* {:conn conn
                                                             :mailjet-config mailjet-config
                                                             :topic-type topic-type*
                                                             :topic-id topic-id
                                                             :assigned-by assigned-by})
                                       []
                                       reviewers)}))))

(defn change-reviewers [db mailjet-config topic-type topic-id reviewers admin]
  (let [topic-type* (util/get-internal-topic-type topic-type)
        assigned-by (:id admin)]
    (if (= "ADMIN" (:role admin))
      (jdbc/with-db-transaction [conn (:spec db)]
        (let [reviews (db.review/reviews-filter conn {:topic-type topic-type* :topic-id topic-id})
              current-reviewers (set (map :reviewer reviews))
              [reviewers-to-delete reviewers-to-create reviewers-to-keep] (let [news (set reviewers)
                                                                                olds (set current-reviewers)
                                                                                to-keep (set/intersection news olds)
                                                                                to-delete (set/difference olds news)
                                                                                to-create (set/difference news olds)]
                                                                            [to-delete to-create to-keep])
              reviews-to-delete (filter #(contains? reviewers-to-delete (:reviewer %)) reviews)]
          (doseq [r reviews-to-delete]
            (db.review/delete-review-by-id conn {:id (:id r)}))
          (resp/response {:reviews (into
                                    reviewers-to-keep
                                    (reduce (partial new-review* {:conn conn
                                                                  :mailjet-config mailjet-config
                                                                  :topic-type topic-type*
                                                                  :topic-id topic-id
                                                                  :assigned-by assigned-by}) [] reviewers-to-create))})))
      {:status 403 :body {:message "Cannot update reviewers for this topic"}})))

(def resp403 {:status 403 :body {:message "Cannot update review for this topic"}})

(defn update-review-status [db mailjet-config topic-type topic-id review-status review-comment reviewer]
  (let [topic-type* (util/get-internal-topic-type topic-type)]
    (jdbc/with-db-transaction [conn (:spec db)]
      (if-let [review (first (db.review/reviews-filter
                              conn
                              {:topic-type topic-type* :topic-id topic-id :reviewer (:id reviewer)}))]
        ;; If assigned to the current-user
        (if (= (:reviewer review) (:id reviewer))
          (let [review-id (db.review/update-review-status
                           conn
                           {:id (:id review)
                            :review-status review-status
                            :review-comment review-comment})
                admin (db.stakeholder/stakeholder-by-id conn {:id (:assigned_by review)})]
            (email/send-email mailjet-config
                              email/unep-sender
                              (format "[%s] Review submitted on %s: %s" (:app-name mailjet-config) topic-type (:title review))
                              (list {:Name (email/get-user-full-name admin) :Email (:email admin)})
                              (list (email/notify-review-submitted-text
                                     (email/get-user-full-name admin) (:app-domain mailjet-config) topic-type (:title review) review-status review-comment))
                              (list nil))
            (resp/response review-id))
          resp403)
        resp403))))

(defn list-reviews [db reviewer page limit status only]
  (let [conn (:spec db)
        review-status (and status (str/split status #","))
        params {:reviewer (:id reviewer) :page page :limit limit :review-status review-status
                :only only}
        reviews (reviews-by-reviewer-id conn params)
        count (:count (db.review/count-by-reviewer-id conn params))
        pages (util/page-count count limit)]
    (resp/response {:reviews reviews :page page :limit limit :pages pages :count count})))

(defmethod ig/init-key ::get-reviewers [_ {:keys [db]}]
  (fn [_]
    (get-reviewers db)))

(defmethod ig/init-key ::new-multiple-review [_ {:keys [db mailjet-config]}]
  (fn [{{{:keys [topic-type topic-id]} :path
         {:keys [reviewers]} :body} :parameters
        admin :admin}]
    (new-multiple-review db mailjet-config topic-type topic-id reviewers (:id admin))))

(defmethod ig/init-key ::update-review [_ {:keys [db mailjet-config]}]
  (fn [{{{:keys [topic-type topic-id]} :path
         {:keys [review-status review-comment reviewers]} :body} :parameters
        current-user :reviewer}]
    (if reviewers
      (change-reviewers db mailjet-config topic-type topic-id reviewers current-user)
      (update-review-status db mailjet-config topic-type topic-id review-status review-comment current-user))))

(defmethod ig/init-key ::list-user-reviews [_ {:keys [db]}]
  (fn [{{{:keys [page limit review-status only]} :query} :parameters
        reviewer :reviewer}]
    (list-reviews db reviewer page limit review-status only)))

(defmethod ig/init-key ::review-status-params [_ _]
  (apply conj [:enum] (map name constants/reviewer-review-status)))

(defmethod ig/init-key ::list-user-reviews-params [_ _]
  {:query [:map
           [:page {:optional true
                   :default 1}
            int?]
           [:limit {:optional true
                    :default 10}
            int?]
           [:only {:optional true} [:enum "resources" "stakeholders"]]
           [:review-status {:optional true}
            [:re review-status-re]]]})

(defn get-reviews [db topic-type topic-id]
  (let [conn (:spec db)
        topic-type (util/get-internal-topic-type topic-type)
        reviews (db.review/reviews-filter
                 conn
                 {:topic-type topic-type :topic-id topic-id})]
    (resp/response reviews)))

(defmethod ig/init-key ::get-reviews [_ {:keys [db]}]
  (fn [{{{:keys [topic-type topic-id]} :path} :parameters}]
    (get-reviews db topic-type topic-id)))
