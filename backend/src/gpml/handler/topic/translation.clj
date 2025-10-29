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
    [:content map?]]])

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

(def ^:private delete-params
  [:map
   [:topics {:description "Comma-separated pairs of topic-type:id (e.g. 'policy:1,event:2'). If provided, deletes only these specific topics. No confirmation needed."
             :example "policy:1,event:2"
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
                (map #(str/split % #":"))
                (mapv (fn [[topic-type topic-id]]
                        {:topic-type topic-type
                         :topic-id (Integer/parseInt topic-id)})))))}
      [:map
       [:topic-type string?]
       [:topic-id int?]]]]]
   [:topic-type {:description "Topic type (e.g. 'policy', 'event'). If provided without topics param, deletes ALL translations of this type. Requires confirm=true."
                 :example "policy"
                 :swagger {:type "string"
                           :allowEmptyValue true}
                 :optional true}
    [:maybe [:string {:min 1}]]]
   [:confirm {:description "Confirmation flag required for dangerous operations (delete by type or delete all). Must be 'true'."
              :example "true"
              :swagger {:type "boolean"
                        :allowEmptyValue true}
              :optional true}
    [:maybe
     [:boolean
      {:decode/string
       (fn [s]
         (case (str/lower-case (str s))
           "true" true
           "false" false
           nil))}]]]])

(defmethod ig/init-key ::delete-params [_ _]
  delete-params)

(defmethod ig/init-key ::get
  [_ config]
  (fn [{{:keys [query]} :parameters}]
    (if (empty? (:topics query))
      (resp/response {:success? true :translations []})
      (let [auto-translate-enabled? (get-in config [:auto-translate :enabled] false)
            result (if auto-translate-enabled?
                     (svc.topic.translation/get-bulk-translations-with-auto-translate
                      config (:topics query) (:language query) (:fields query))
                     (svc.topic.translation/get-bulk-topic-translations
                      config (:topics query) (:language query) (:fields query)))]
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

(defmethod ig/init-key ::delete
  [_ config]
  (fn [{{:keys [query]} :parameters user :user}]
    (if-not user
      (r/forbidden {:message "Authentication required"})
      (let [topics (:topics query)
            topic-type (:topic-type query)
            confirm? (:confirm query)

            ;; Determine deletion strategy
            result (cond
                     ;; Strategy 1: Delete specific topics (no confirmation needed)
                     (and topics (seq topics))
                     (svc.topic.translation/delete-bulk-topic-translations config topics)

                     ;; Strategy 2: Delete all of a specific type (requires confirmation)
                     (and topic-type (seq topic-type))
                     (if (true? confirm?)
                       (svc.topic.translation/delete-topic-translations-by-type config topic-type)
                       {:success? false
                        :reason :confirmation-required
                        :message "Deleting all translations of a type requires confirm=true parameter"})

                     ;; Strategy 3: Delete ALL translations (requires confirmation)
                     :else
                     (if (true? confirm?)
                       (svc.topic.translation/delete-all-topic-translations config)
                       {:success? false
                        :reason :confirmation-required
                        :message "Deleting all translations requires confirm=true parameter"}))]

        ;; Handle result
        (if (:success? result)
          (resp/response {:success? true
                          :deleted-count (:deleted-count result)
                          :by-type (:by-type result)})
          (if (= (:reason result) :confirmation-required)
            (r/bad-request result)
            (r/server-error result)))))))
