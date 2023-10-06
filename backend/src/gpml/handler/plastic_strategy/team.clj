(ns gpml.handler.plastic-strategy.team
  (:require [camel-snake-kebab.core :refer [->kebab-case]]
            [camel-snake-kebab.extras :as cske]
            [clojure.string :as str]
            [gpml.domain.types :as dom.types]
            [gpml.handler.responses :as r]
            [gpml.service.plastic-strategy.team :as srv.ps.team]
            [integrant.core :as ig]
            [malli.util :as mu]))

(def ^:private common-ps-team-members-path-params-schema
  [:map
   [:iso_code_a2
    {:swagger {:description "The country ISO Code Alpha 2."
               :type "string"}}
    [:string {:decode/string str/upper-case
              :max 2}]]])

(def ^:private add-ps-team-member-body-params-schema
  [:map
   [:user_id
    {:swagger {:description "The GPML user ID to add as team member."
               :type "integer"}}
    [:int {:min 1}]]
   [:teams
    {:swagger {:description "An array of team types the team member participates in."
               :type "array"
               :items {:type "string"
                       :enum (map str dom.types/plastic-strategy-team-types)}}}
    [:sequential
     (dom.types/get-type-schema :plastic-strategy-team-type)]]
   [:role
    {:swagger {:description "The team member role."
               :type "string"
               :enum (map str dom.types/plastic-strategy-team-roles)}}
    (dom.types/get-type-schema :plastic-strategy-team-role)]])

(def ^:private update-ps-team-member-body-params-schema
  (mu/optional-keys add-ps-team-member-body-params-schema [:teams :role]))

(defn- add-ps-team-member
  [config {{:keys [path body]} :parameters}]
  (let [body-params (cske/transform-keys ->kebab-case body)
        country-iso-code-a2 (:iso_code_a2 path)
        _ (prn body-params)
        result (srv.ps.team/add-ps-team-member config
                                               country-iso-code-a2
                                               body-params)]
    (if (:success? result)
      (r/ok {})
      (if (= (:reason result) :plastic-strategy-not-found)
        (r/not-found {})
        (r/server-error (dissoc result :success?))))))

(defn- update-ps-team-member
  [config {{:keys [path body]} :parameters}]
  (let [body-params (cske/transform-keys ->kebab-case body)
        country-iso-code-a2 (:iso_code_a2 path)
        result (srv.ps.team/update-ps-team-member config
                                                  country-iso-code-a2
                                                  body-params)]
    (if (:success? result)
      (r/ok {})
      (if (= (:reason result) :plastic-strategy-not-found)
        (r/not-found {})
        (r/server-error (dissoc result :success?))))))

(defn- get-ps-team-members
  [config req]
  (let [country-iso-code-a2 (get-in req [:parameters :path :iso_code_a2])
        result (srv.ps.team/get-ps-team-members config
                                                country-iso-code-a2)]
    (if (:success? result)
      (r/ok (:ps-team-members result))
      (if (= (:reason result) :not-found)
        (r/not-found {})
        (r/server-error (dissoc result :success?))))))

(defmethod ig/init-key :gpml.handler.plastic-strategy.team/get-members
  [_ config]
  (fn [req]
    (get-ps-team-members config req)))

(defmethod ig/init-key :gpml.handler.plastic-strategy.team/get-members-params
  [_ _]
  {:path common-ps-team-members-path-params-schema})

(defmethod ig/init-key :gpml.handler.plastic-strategy.team/add-member
  [_ config]
  (fn [req]
    (add-ps-team-member config req)))

(defmethod ig/init-key :gpml.handler.plastic-strategy.team/add-member-params
  [_ _]
  {:path common-ps-team-members-path-params-schema
   :body add-ps-team-member-body-params-schema})

(defmethod ig/init-key :gpml.handler.plastic-strategy.team/update-member
  [_ config]
  (fn [req]
    (update-ps-team-member config req)))

(defmethod ig/init-key :gpml.handler.plastic-strategy.team/update-member-params
  [_ _]
  {:path common-ps-team-members-path-params-schema
   :body update-ps-team-member-body-params-schema})
