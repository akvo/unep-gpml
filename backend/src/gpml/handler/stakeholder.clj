(ns gpml.handler.stakeholder
  (:require [clojure.string :as str]
            [gpml.constants :as constants]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.handler.util :as util]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def roles-re (->> constants/user-roles
                   (map name)
                   (str/join "|")
                   (format "^(%1$s)((,(%1$s))+)?$")
                   re-pattern))

(defmethod ig/init-key :gpml.handler.stakeholder/list [_ {:keys [db]}]
  (fn [{{{:keys [page limit email-like roles] :as query} :query} :parameters
        user :user approved? :approved?}]
    (resp/response (if (and approved? (= (:role user) "ADMIN"))
                     ;; FIXME: Currently hard-coded to allow only for ADMINS.
                     (let [search (and email-like (format "%%%s%%" email-like))
                           roles (and roles (str/split roles #","))
                           params (assoc query :email-like search :roles roles)
                           stakeholders (db.stakeholder/list-stakeholder-paginated (:spec db) params)
                           count (:count (db.stakeholder/count-stakeholder (:spec db) params))
                           pages (util/page-count count limit)]
                       ;; FIXME: The response is differently shaped
                       ;; for ADMINS and other users. This should be
                       ;; changed once the work on the other branches
                       ;; is finalized. Currently, leaving the public
                       ;; response shape as before to not break other
                       ;; uses of this end-point.
                       {:stakeholders stakeholders :page page :limit limit :pages pages :count count})
                     ;; FIXME: limit & page are ignored when returning public stakeholders!
                     (->> (db.stakeholder/all-public-stakeholder (:spec db))
                          (map #(select-keys % [:id :title :first_name :last_name :email])))))))

(defmethod ig/init-key ::list-params [_ _]
  {:query [:map
           [:page {:optional true
                   :default 1}
            int?]
           [:limit {:optional true
                    :default 10}
            int?]
           [:review-status {:optional true}
            (apply conj [:enum] (->> constants/admin-review-status (map name)))]
           [:roles {:optional true}
            [:re roles-re]]
           [:email-like {:optional true}
            string?]]})

(defmethod ig/init-key :gpml.handler.stakeholder/patch [_ {:keys [db]}]
  (fn [{{{:keys [id]} :path
         {:keys [role]} :body}
        :parameters
        admin :admin}]
    (let [params {:role role :reviewed_by (:id admin) :id id}
          count (db.stakeholder/update-stakeholder-role (:spec db) params)]
      (resp/response {:status (if (= count 1) "success" "failed")}))))

(defmethod ig/init-key ::patch-params [_ _]
  {:path [:map [:id int?]]
   :body [:map [:role
                (apply conj [:enum] (->> constants/user-roles (map name)))]]})
