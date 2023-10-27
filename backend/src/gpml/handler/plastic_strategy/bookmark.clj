(ns gpml.handler.plastic-strategy.bookmark
  (:require [camel-snake-kebab.core :refer [->kebab-case]]
            [camel-snake-kebab.extras :as cske]
            [clojure.string :as str]
            [gpml.domain.types :as dom.types]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.service.plastic-strategy :as srv.ps]
            [gpml.service.plastic-strategy.bookmark :as srv.ps.bookmark]
            [integrant.core :as ig]))

(def ^:private common-ps-bookmark-path-params-schema
  [:map
   [:iso_code_a2
    {:swagger {:description "The country ISO Code Alpha 2."
               :type "string"}}
    [:string {:decode/string str/upper-case
              :max 2}]]])

(def ^:private handle-ps-bookmark-body-params-schema
  [:map
   [:bookmark
    {:swagger {:description "A boolean value that determines if the entity is bookmarked or not."
               :type "boolean"}}
    [:boolean]]
   [:entity_id
    {:swagger {:description "The entity ID to un/bookmark."
               :type "integer"}}
    [:int {:min 1}]]
   [:entity_type
    {:swagger {:description "The entity type to un/bookmark."
               :type "string"
               :enum (map name dom.types/plastic-strategy-bookmarkable-entity-types)}}
    (dom.types/get-type-schema :plastic-strategy-bookmarkable-entity-type)]
   [:section_key
    {:swagger {:description "The section key where the bookmark belongs to."
               :type "string"
               :allowEmptyValue false}}
    [:string {:min 1}]]])

(defn- handle-ps-bookmark
  [config {:keys [user parameters]}]
  (let [country-iso-code-a2 (get-in parameters [:path :iso_code_a2])
        search-opts {:filters {:countries-iso-codes-a2 [country-iso-code-a2]}}
        {:keys [success? plastic-strategy reason] :as get-ps-result}
        (srv.ps/get-plastic-strategy config search-opts)]
    (if-not success?
      (if (= reason :not-found)
        (r/not-found {})
        (r/server-error (dissoc get-ps-result :success?)))
      (if-not (h.r.permission/operation-allowed? config
                                                 {:user-id (:id user)
                                                  :entity-type :plastic-strategy
                                                  :entity-id (:id plastic-strategy)
                                                  :operation-type :bookmark
                                                  :root-context? false})
        (r/forbidden {:message "Unauthorized"})
        (let [body-params (-> (cske/transform-keys ->kebab-case (:body parameters))
                              (assoc :plastic-strategy-id (:id plastic-strategy)))
              result (srv.ps.bookmark/handle-ps-bookmark config body-params)]
          (if (:success? result)
            (r/ok {})
            (if (= (:reason result) :already-exists)
              (r/conflict {:reason :already-exists})
              (r/server-error (dissoc result :success?)))))))))

(defmethod ig/init-key :gpml.handler.plastic-strategy.bookmark/post
  [_ config]
  (fn [req]
    (handle-ps-bookmark config req)))

(defmethod ig/init-key :gpml.handler.plastic-strategy.bookmark/post-params
  [_ _]
  {:path common-ps-bookmark-path-params-schema
   :body handle-ps-bookmark-body-params-schema})
