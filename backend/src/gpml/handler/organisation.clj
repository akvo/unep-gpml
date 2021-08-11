(ns gpml.handler.organisation
  (:require [gpml.db.invitation :as db.invitation]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.email-util :as email]
            [gpml.geo-util :as geo]
            [gpml.handler.geo :as handler.geo]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn find-or-create [conn org]
  (let [org-id (:id (db.organisation/new-organisation conn (dissoc org :id)))
        org-geo (handler.geo/get-geo-vector org-id org)]
    (when (seq org-geo)
      (db.organisation/add-geo-coverage conn {:geo org-geo}))
    org-id))

(defmethod ig/init-key :gpml.handler.organisation/get [_ {:keys [db]}]
  (fn [_]
      (resp/response (db.organisation/all-organisation (:spec db)))))

(defmethod ig/init-key :gpml.handler.organisation/get-id [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters}]
    (let [conn (:spec db)
          organisation (db.organisation/organisation-by-id conn path)
          geo (db.organisation/geo-coverage conn organisation)
          geo-coverage (cond
                (= (:geo_coverage_type organisation) "regional")
                (mapv #(:name %) geo)
                (= (:geo_coverage_type organisation) "global")
                (mapv #(:iso_code %) geo))]
      (resp/response (assoc organisation :geo_coverage_value geo-coverage)))))

(defmethod ig/init-key :gpml.handler.organisation/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [body-params referrer jwt-claims]}]
    (let [first-contact (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)
          org-id (let [params (assoc body-params :created_by (:id first-contact))
                       second-contact-email (:stakeholder body-params)]
                   (if-let [second-contact (db.stakeholder/stakeholder-by-email (:spec db) {:email second-contact-email})]
                     (->> (assoc params :second_contact (:id second-contact))
                          (find-or-create (:spec db)))
                     (let [org-id (find-or-create (:spec db) params)]
                       (db.invitation/new-invitation (:spec db) {:stakeholder-id (:id first-contact)
                                                                 :organisation-id org-id
                                                                 :email second-contact-email
                                                                 :accepted nil})
                       (let [full-contact-details (format "%s. %s %s" (:title first-contact) (:first_name first-contact) (:last_name first-contact))]
                         (email/send-email mailjet-config
                                                {:Name "UNEP GPML Digital Platform" :Email "no-reply@gpmarinelitter.org"}
                                                (email/notify-user-invitation-subject full-contact-details)
                                                (list {:Name second-contact-email :Email second-contact-email})
                                                (list (email/notify-user-invitation-text full-contact-details (:app-domain mailjet-config) (:name body-params)))
                                                (list nil)))
                       org-id)))]
      (resp/created referrer (assoc body-params :id org-id)))))

(defmethod ig/init-key :gpml.handler.organisation/post-params [_ _]
  [:map
   [:name string?]
   [:url string?]
   [:stakeholder string?]
   [:country int?]
   [:geo_coverage_type geo/coverage_type]
   [:geo_coverage_value
    [:vector {:min 1 :error/message "Need at least one of geo coverage value"} int?]]])
