(ns gpml.handler.organisation
  (:require [gpml.db.invitation :as db.invitation]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.email-util :as email]
            [gpml.geo-util :as geo]
            [gpml.handler.geo :as handler.geo]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn create [conn org]
  (let [org-id (:id (db.organisation/new-organisation conn (dissoc org :id)))
        org-geo (handler.geo/get-geo-vector org-id org)]
    (when (seq org-geo)
      (db.organisation/add-geo-coverage conn {:geo org-geo}))
    org-id))

(defn update-org [conn org]
  (let [org-id (do (db.organisation/update-organisation conn org)
                   (:id org))
        org-geo (handler.geo/get-geo-vector org-id org)]
    (when (seq org-geo)
      (db.organisation/delete-geo-coverage conn org)
      (db.organisation/add-geo-coverage conn {:id org-id :geo org-geo}))
    (when (seq (:expertise org))
      (db.organisation/delete-organisation-tags conn org)
      (db.organisation/add-organisation-tags conn {:tags (map #(vector org-id %) (:expertise org ))}))
    org-id))


(defmethod ig/init-key :gpml.handler.organisation/get [_ {:keys [db]}]
  (fn [_]
      (resp/response (db.organisation/all-members (:spec db)))))

(defmethod ig/init-key :gpml.handler.organisation/get-id [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters}]
    (let [conn (:spec db)
          organisation (db.organisation/organisation-by-id conn path)
          geo (db.organisation/geo-coverage conn organisation)
          seeks (:tags (first (db.organisation/organisation-tags conn path)))
          geo-coverage (cond
                         (= (:geo_coverage_type organisation) "regional")
                         (mapv #(:geo_coverage_values %) geo)
                         (= (:geo_coverage_type organisation) "transnational")
                         (mapv #(:geo_coverage_values %) geo)
                         (= (:geo_coverage_type organisation) "global with elements in specific areas")
                         (mapv #(:geo_coverage_values %) geo)
                         (= (:geo_coverage_type organisation) "national")
                         (mapv #(:geo_coverage_values %) geo)
                         (= (:geo_coverage_type organisation) "global")
                         (mapv #(:iso_code %) geo))]
      (resp/response (assoc organisation :geo_coverage_value geo-coverage
                            :expertise seeks)))))

(defmethod ig/init-key :gpml.handler.organisation/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [body-params referrer jwt-claims]}]
    (let [first-contact (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)
          org-id (let [params (assoc body-params :created_by (:id first-contact))
                       second-contact-email (:stakeholder body-params)]
                   (if-let [second-contact (db.stakeholder/stakeholder-by-email (:spec db) {:email second-contact-email})]
                     (->> (assoc params :second_contact (:id second-contact))
                          (create (:spec db)))
                     (let [org-id (create (:spec db) params)]
                       (db.invitation/new-invitation (:spec db) {:stakeholder-id (:id first-contact)
                                                                 :organisation-id org-id
                                                                 :email second-contact-email
                                                                 :accepted nil})
                       (let [full-contact-details (format "%s. %s %s" (:title first-contact) (:first_name first-contact) (:last_name first-contact))]
                         (email/send-email mailjet-config
                                           email/unep-sender
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

(defmethod ig/init-key :gpml.handler.organisation/put [_ {:keys [db]}]
  (fn [{:keys [body-params referrer parameters]}]
    (let [org-id (update-org db (assoc body-params :id (:id (:path parameters))))]
      (resp/created referrer (assoc body-params :id org-id)))))

(defmethod ig/init-key :gpml.handler.organisation/put-params [_ _]
  [:map
   [:name string?]
   [:url string?]
   [:logo {:optional true} string?]
   [:country int?]
   [:geo_coverage_type geo/coverage_type]
   [:geo_coverage_value {:optional true}
    [:vector {:min 1 :error/message "Need at least one of geo coverage value"} int?]]
   [:type string?]
   [:representative_group_other [:maybe int?]]
   [:representative_group_civil_society [:maybe string?]]
   [:representative_group_private_sector [:maybe int?]]
   [:representative_group_government [:maybe string?]]
   [:representative_group_academia_research [:maybe string?]]
   [:expertise vector?]
   [:program string?]])
