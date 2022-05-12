(ns gpml.handler.organisation
  (:require
   [gpml.db.invitation :as db.invitation]
   [gpml.db.organisation :as db.organisation]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.email-util :as email]
   [gpml.geo-util :as geo]
   [gpml.handler.geo :as handler.geo]
   [gpml.handler.resource.tag :as handler.resource.tag]
   [integrant.core :as ig]
   [ring.util.response :as resp]))

(defn create [conn mailjet-config org]
  (let [org-id (:id (db.organisation/new-organisation conn org))
        org-geo2 (handler.geo/get-geo-vector-v2 org-id org)
        org-geo (handler.geo/get-geo-vector org-id org)]
    (if (seq org-geo2)
      (db.organisation/add-geo-coverage conn {:geo org-geo2})
      (when (seq org-geo)
        (db.organisation/add-geo-coverage conn {:geo org-geo})))
    (when (seq (:tags org))
      (handler.resource.tag/create-resource-tags conn
                                                 mailjet-config
                                                 {:tags (:tags org)
                                                  :tag-category "general"
                                                  :resource-name "organisation"
                                                  :resource-id org-id}))
    org-id))

(defn update-org [conn mailjet-config org]
  (let [org-id (do (db.organisation/update-organisation conn org)
                   (:id org))
        org-geo (handler.geo/get-geo-vector org-id org)
        org-geo2 (handler.geo/get-geo-vector-v2 org-id org)]
    (if (seq org-geo2)
      (do
        (db.organisation/delete-geo-coverage conn org)
        (db.organisation/add-geo-coverage conn {:id org-id :geo org-geo2}))
      (when (seq org-geo)
        (db.organisation/delete-geo-coverage conn org)
        (db.organisation/add-geo-coverage conn {:id org-id :geo org-geo})))
    (when (seq (:tags org))
      (handler.resource.tag/update-resource-tags conn mailjet-config {:tags (:tags org)
                                                                      :tag-category "general"
                                                                      :resource-name "organisation"
                                                                      :resource-id org-id}))
    org-id))

(defmethod ig/init-key :gpml.handler.organisation/get [_ {:keys [db]}]
  (fn [_]
    (resp/response (db.organisation/all-members (:spec db)))))

(defmethod ig/init-key :gpml.handler.organisation/get-id [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters}]
    (let [conn (:spec db)
          organisation (db.organisation/organisation-by-id conn path)
          seeks (:tags (first (db.organisation/organisation-tags conn path)))
          geo-coverage (let [data (db.organisation/geo-coverage-v2 conn organisation)]
                         {:geo_coverage_countries      (vec (filter some? (mapv :country data)))
                          :geo_coverage_country_groups (vec (filter some? (mapv :country_group data)))})]
      (resp/response (merge (assoc organisation :expertise seeks) geo-coverage)))))

(defmethod ig/init-key :gpml.handler.organisation/post [_ {:keys [db mailjet-config]}]
  (fn [{:keys [body-params referrer jwt-claims]}]
    (let [first-contact (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims)
          org-id (let [params (assoc body-params :created_by (:id first-contact))
                       second-contact-email (:stakeholder body-params)]
                   (if-let [second-contact (db.stakeholder/stakeholder-by-email (:spec db) {:email second-contact-email})]
                     (->> (assoc params :second_contact (:id second-contact))
                          (create (:spec db) mailjet-config))
                     (let [org-id (create (:spec db) mailjet-config params)]
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
  (into [:map
         [:name string?]
         [:url string?]
         [:is_member boolean?]
         [:stakeholder string?]
         [:country int?]
         [:geo_coverage_type geo/coverage_type]
         [:tags {:optional true}
          [:vector {:optional true}
           [:map {:optional true}
            [:id {:optional true} pos-int?]
            [:tag string?]
            [:tag_category string?]]]]]
        handler.geo/params-payload))

(defmethod ig/init-key :gpml.handler.organisation/put [_ {:keys [db mailjet-config]}]
  (fn [{:keys [body-params referrer parameters]}]
    (let [org-id (update-org db mailjet-config (assoc body-params :id (:id (:path parameters))))]
      (resp/created referrer (assoc body-params :id org-id)))))

(defmethod ig/init-key :gpml.handler.organisation/put-params [_ _]
  (into [:map
         [:name {:optional true} string?]
         [:url {:optional true} string?]
         [:logo {:optional true} string?]
         [:country {:optional true} int?]
         [:geo_coverage_type {:optional true} geo/coverage_type]
         [:type {:optional true} string?]
         [:representative_group_other {:optional true} [:maybe string?]]
         [:representative_group_civil_society {:optional true} [:maybe string?]]
         [:representative_group_private_sector {:optional true} [:maybe string?]]
         [:representative_group_government {:optional true} [:maybe string?]]
         [:representative_group_academia_research {:optional true} [:maybe string?]]
         [:subnational_area {:optional true} [:maybe string?]]
         [:expertise {:optional true} vector?]
         [:program {:optional true} string?]
         [:tags {:optional true}
          [:vector {:optional true}
           [:map {:optional true}
            [:id {:optional true} pos-int?]
            [:tag string?]
            [:tag_category {:optional true} string?]]]]]
        handler.geo/params-payload))
