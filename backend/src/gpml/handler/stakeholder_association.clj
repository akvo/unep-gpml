(ns gpml.handler.stakeholder-association
  (:require [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.stakeholder-association :as db.stakeholder-association]
            [gpml.util :as util]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def ^:const associations
  #{"owner" "implementor" "partner" "donor" "interested in"})

;; TODO: use update-if-exists instead of update
(defn api-associated-topics-opts->associated-topics-opts
  [api-associated-topics-opts]
  (-> api-associated-topics-opts
      (update :page #(Integer/parseInt %))
      (update :limit #(Integer/parseInt %))))

(defmethod ig/init-key ::get-associated-topics
  [_ {:keys [db]}]
  (fn [{:keys [parameters]}]
    (let [{:keys [association limit page]} (api-associated-topics-opts->associated-topics-opts (:query parameters))
          common-params {:stakeholder-id (-> parameters :path :id)
                         :association association}
          associated-topics
          (db.stakeholder-association/get-stakeholder-associated-topics (:spec db)
                                                                        (merge common-params
                                                                               {:limit limit
                                                                                :offset (* limit page)}))
          associated-topics-count
          (db.stakeholder-association/get-stakeholder-associated-topics (:spec db)
                                                                        (merge common-params {:count-only? true}))]
      (resp/response {:associated_topics (map :json associated-topics)
                      :count (-> associated-topics-count first :count)}))))

(defmethod ig/init-key ::get-associated-topics-params [_ _]
  {:path [:map [:id pos-int?]]
   :query [:map
           [:page {:optional true
                   :default "0"}
            string?]
           [:limit {:optional true
                    :default "3"}
            string?]
           [:association
            (apply conj [:enum] associations)]]})
