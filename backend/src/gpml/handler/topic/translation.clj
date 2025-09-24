(ns gpml.handler.topic.translation
  (:require
   [gpml.handler.responses :as r]
   [gpml.service.topic.translation :as svc.topic.translation]
   [integrant.core :as ig]
   [ring.util.response :as resp]))

(def ^:private upsert-params
  [:vector {:min 1}
   [:map
    [:topic-type [:string {:min 1}]]
    [:topic-id [:int {:min 1}]]
    [:language [:string {:min 2 :max 3}]]
    [:content [:map]]]])

(defmethod ig/init-key ::upsert-params [_ _]
  upsert-params)

(defmethod ig/init-key ::upsert
  [_ {:keys [db] :as config}]
  (fn [{{:keys [body]} :parameters user :user}]
    (if user
      (let [result (svc.topic.translation/upsert-bulk-topic-translations config body)]
        (if (:success? result)
          (resp/response {:success? true :upserted-count (:upserted-count result)})
          (if (= :foreign-key-constraint-violation (:reason result))
            (r/bad-request result)
            (r/server-error result))))
      (r/forbidden {:message "Authentication required"}))))