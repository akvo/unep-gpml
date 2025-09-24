(ns gpml.handler.topic.translation
  (:require
   [clojure.string :as str]
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

(def ^:private get-params
  [:map
   [:topics {:description "Comma-separated pairs of topic-type:id (e.g. 'policy:1,event:2,initiative:3')"
             :example "policy:1,event:2,initiative:3"
             :swagger {:type "string"
                       :collectionFormat "csv"
                       :allowEmptyValue false}}
    [:vector
     {:decode/string
      (fn [s]
        (if (empty? s)
          []
          (->> (str/split s #",")
               (map #(str/split % #":"))
               (mapv (fn [[topic-type topic-id]]
                       {:topic-type topic-type
                        :topic-id (Integer/parseInt topic-id)})))))}
     [:map
      [:topic-type string?]
      [:topic-id int?]]]]
   [:language {:description "Language code (2-3 characters, e.g. 'en', 'es', 'fra')"
               :example "en"}
    [:string {:min 2 :max 3}]]
   [:fields {:description "Comma-separated content fields to include (e.g. 'title,summary,description')"
             :example "title,summary"
             :swagger {:type "string"
                       :collectionFormat "csv"
                       :allowEmptyValue true}
             :optional true}
    [:maybe
     [:vector
      {:decode/string
       (fn [s]
         (if (or (nil? s) (empty? s))
           nil
           (->> (str/split s #",")
                (map str/trim)
                (remove empty?)
                vec)))}
      string?]]]])

(defmethod ig/init-key ::upsert-params [_ _]
  upsert-params)

(defmethod ig/init-key ::get-params [_ _]
  get-params)

(defmethod ig/init-key ::get
  [_ config]
  (fn [{{:keys [query]} :parameters}]
    (if (empty? (:topics query))
      (resp/response {:success? true :translations []})
      (let [result (svc.topic.translation/get-bulk-topic-translations config (:topics query) (:language query) (:fields query))]
        (if (:success? result)
          (resp/response {:success? true :translations (:translations result)})
          (r/server-error result))))))

(defmethod ig/init-key ::upsert
  [_ config]
  (fn [{{:keys [body]} :parameters user :user}]
    (if user
      (let [result (svc.topic.translation/upsert-bulk-topic-translations config body)]
        (if (:success? result)
          (resp/response {:success? true :upserted-count (:upserted-count result)})
          (if (= :foreign-key-constraint-violation (:reason result))
            (r/bad-request result)
            (r/server-error result))))
      (r/forbidden {:message "Authentication required"}))))
