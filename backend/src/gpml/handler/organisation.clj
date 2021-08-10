(ns gpml.handler.organisation
  (:require [gpml.db.organisation :as db.organisation]
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
    (let [first-contact-id (:id (db.stakeholder/stakeholder-by-email (:spec db) jwt-claims))
          body-params (let [params (assoc body-params :created_by first-contact-id)
                            second-contact-email (:stakeholder body-params)]
                          (if-let [second-contact (db.stakeholder/stakeholder-by-email (:spec db) {:email second-contact-email})]
                            (assoc params :second-contact (:id second-contact))
                            (do
                              (email/send-email mailjet-config
                                                {:Name "UNEP GPML Digital Platform" :Email "no-reply@gpmarinelitter.org"}
                                                "Inviting not existent stakeholder to join unep-gpml platform"
                                                '({:Name "juan" :Email second-contact-email})
                                                '("Please join the platform at .....")
                                                (repeat nil))
                              params)))]
      (if-let [org-id (find-or-create (:spec db) body-params)]
        (resp/created referrer (assoc body-params :id org-id))
        (assoc (resp/status 500) :body "Internal Server Error")))))

(defmethod ig/init-key :gpml.handler.organisation/post-params [_ _]
  [:map
   [:name string?]
   [:url string?]
   [:stakeholder string?]
   [:country int?]
   [:geo_coverage_type geo/coverage_type]
   [:geo_coverage_value
    [:vector {:min 1 :error/message "Need at least one of geo coverage value"} int?]]])
