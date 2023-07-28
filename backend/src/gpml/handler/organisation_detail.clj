(ns gpml.handler.organisation-detail
  (:require [gpml.db.organisation-detail :as db.organisation-detail]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.service.permissions :as srv.permissions]
            [gpml.util :as util]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(defn api-organisation-detail-opts->organisation-detail-opts
  [api-organisation-detail-opts]
  (-> api-organisation-detail-opts
      (util/update-if-not-nil :page #(Integer/parseInt %))
      (util/update-if-not-nil :limit #(Integer/parseInt %))))

(defn- remove-nil-connections [{:keys [stakeholder_connections entity_connections] :as content}]
  (let [empty-stakeholder-connections? (nil? (:id (first stakeholder_connections)))
        empty-entity-connections? (nil? (:id (first entity_connections)))]
    (cond
      (not (and empty-stakeholder-connections? empty-entity-connections?))
      (assoc content :stakeholder_connections (distinct stakeholder_connections)
             :entity_connections (distinct entity_connections))

      (and empty-stakeholder-connections? empty-entity-connections?)
      (assoc content :stakeholder_connections nil :entity_connections nil)

      empty-stakeholder-connections?
      (assoc content :stakeholder_connections nil)

      empty-entity-connections?
      (assoc content :entity_connections nil)

      :else
      content)))

(defmethod ig/init-key ::get-content
  [_ {:keys [db]}]
  (fn [{:keys [parameters]}]
    (let [conn (:spec db)
          {:keys [limit page]} (api-organisation-detail-opts->organisation-detail-opts (:query parameters))
          params {:id (-> parameters :path :id)
                  :limit limit
                  :offset (* limit page)}
          associated-content (db.organisation-detail/get-associated-content-by-org conn params)
          api-associated-content (map remove-nil-connections associated-content)
          associated-content-count (db.organisation-detail/get-associated-content-by-org
                                    conn (assoc params :count-only? true))]
      (resp/response {:results api-associated-content
                      :count (-> associated-content-count first :count)}))))

(defmethod ig/init-key ::get-content-params [_ _]
  {:path [:map [:id pos-int?]]
   :query [:map
           [:page {:optional true
                   :default "0"}
            string?]
           [:limit {:optional true
                    :default "3"}
            string?]]})

(defmethod ig/init-key ::get-members
  [_ {:keys [db] :as config}]
  (fn [{:keys [parameters user]}]
    (if (h.r.permission/operation-allowed?
         config
         {:user-id (:id user)
          :entity-type :organisation
          :entity-id srv.permissions/root-app-resource-id
          :operation-type :read
          :custom-context-type srv.permissions/root-app-context-type})
      (let [conn (:spec db)
            {:keys [limit page]} (api-organisation-detail-opts->organisation-detail-opts (:query parameters))
            params {:id (-> parameters :path :id)
                    :limit limit
                    :offset (* limit page)}
            members (db.organisation-detail/get-org-members conn params)
            members-count (db.organisation-detail/get-org-members conn (assoc params :count-only? true))]
        (resp/response {:members members
                        :count (-> members-count first :count)}))
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key ::get-members-params [_ _]
  {:path [:map [:id pos-int?]]
   :query [:map
           [:page {:optional true
                   :default "0"}
            string?]
           [:limit {:optional true
                    :default "3"}
            string?]]})
