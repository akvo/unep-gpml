(ns gpml.handler.resource.translation
  (:require [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.resource.detail :as db.resource.detail]
            [gpml.db.resource.translation :as db.res-translation]
            [gpml.domain.translation :as dom.translation]
            [gpml.domain.types :as dom.types]
            [gpml.handler.resource.permission :as res-permission]
            [gpml.handler.util :as handler.util]
            [gpml.util.sql :as sql-util]
            [integrant.core :as ig]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(defonce ^:private translation-table-sufix "_translation")
(defonce ^:private translation-entity-id-sufix "_id")

(defmethod ig/init-key :gpml.handler.resource.translation/topics [_ _]
  (apply conj [:enum] dom.types/topic-entity-tables))

(defn- is-lowercase?
  [content-str]
  (and (string? content-str)
       (not (str/blank? content-str))
       (= content-str (str/lower-case content-str))))

(defn- is-allowed-translation-entity?
  [topic-type]
  (get dom.types/topic-entity-tables topic-type))

(defn- all-valid-translatable-fields?
  [{:keys [translations topic-type]}]
  (and
   (is-allowed-translation-entity? topic-type)
   (every? (fn [{:keys [translatable_field]}]
             (get-in dom.translation/translatable-fields-by-entity
                     [(keyword topic-type)
                      (keyword translatable_field)]))
           translations)))

(defn- all-valid-translatable-fields-for-deletion?
  [{:keys [translatable_fields topic-type]}]
  (and
   (is-allowed-translation-entity? topic-type)
   (every? (fn [translatable_field]
             (get-in dom.translation/translatable-fields-by-entity
                     [(keyword topic-type)
                      (keyword translatable_field)]))
           translatable_fields)))

(def ^:private put-params
  [:and
   [:map
    [:translations
     [:vector {:min 1
               :error/message "There has to be at least one element"}
      [:map
       [:language
        [:string {:min 2 :max 3}]]
       [:translatable_field
        [:fn {:error/message "It must be lower-cased."}
         is-lowercase?]]
       [:value string?]]]]
    [:topic-type string?]]
   [:fn {:error/message "There is some invalid translatable_field"}
    all-valid-translatable-fields?]])

(def ^:private delete-params
  [:and
   [:map
    [:translations {:optional true}
     [:vector {:min 1
               :error/message "There has to be at least one element"}
      [:map
       [:language {:min 2 :max 3}
        string?]
       [:translatable_field
        [:fn {:error/message "It must be lower-cased."}
         is-lowercase?]]]]]
    [:languages {:optional true}
     [:vector {:min 1
               :error/message "There has to be at least one element"}
      [:string {:min 2 :max 3}]]]
    [:translatable_fields {:optional true}
     [:vector {:min 1
               :error/message "There has to be at least one element"}
      [:fn {:error/message "It must be lower-cased."}
       is-lowercase?]]]
    [:topic-type string?]]
   [:fn {:error/message "There is some invalid translatable_field"}
    all-valid-translatable-fields?]
   [:fn {:error/message "There is some invalid translatable_field"}
    all-valid-translatable-fields-for-deletion?]])

(def ^:private get-query-params
  [:map
   [:langs-only {:optional true}
    boolean?]])

(defmethod ig/init-key :gpml.handler.resource.translation/put-params [_ _]
  put-params)

(defmethod ig/init-key :gpml.handler.resource.translation/query-params [_ _]
  get-query-params)

(defmethod ig/init-key :gpml.handler.resource.translation/delete-params [_ _]
  delete-params)

(defn- api-translation-translation
  [api-translation resource-col topic-id]
  (assoc api-translation resource-col topic-id))

(defn- valid-translation-languages?
  "The translations will be valid if they are not related to the resource's original language"
  [translations original-lang]
  (every? (fn [{:keys [language]}]
            (not= language original-lang))
          translations))

(defmethod ig/init-key :gpml.handler.resource.translation/put
  [_ {:keys [db logger]}]
  (fn [{{{:keys [topic-type topic-id] :as path} :path body :body} :parameters
        user :user}]
    (try
      (let [submission (res-permission/get-resource-if-allowed (:spec db)
                                                               user
                                                               (handler.util/get-internal-topic-type topic-type)
                                                               topic-id
                                                               {:read? false})]
        (if (some? submission)
          (if (valid-translation-languages? (:translations body) (:language submission))
            (let [conn (:spec db)
                  resource-col (keyword (str topic-type translation-entity-id-sufix))
                  parsed-translations (mapv #(api-translation-translation % resource-col topic-id)
                                            (:translations body))
                  res-translation-columns (sql-util/get-insert-columns-from-entity-col parsed-translations)
                  db-res-translations (sql-util/entity-col->persistence-entity-col parsed-translations)
                  result (db.res-translation/create-or-update-translations
                          conn
                          {:table (str topic-type translation-table-sufix)
                           :resource-col (name resource-col)
                           :insert-cols res-translation-columns
                           :translations db-res-translations})]
              (if (> (first result) 0)
                (resp/response {})
                {:status 500
                 :body {:success? false
                        :reason :no-translations-affected}}))
            (resp/bad-request body))
          handler.util/unauthorized))
      (catch Exception e
        (log logger :error ::failed-to-create-or-edit-resource-translations {:exception-message (.getMessage e)
                                                                             :context-data {:path-params path
                                                                                            :body-params body}})
        (let [response {:status 500
                        :body {:success? false
                               :reason :failed-to-create-or-edit-resource-translations}}]
          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(defmethod ig/init-key :gpml.handler.resource.translation/delete
  [_ {:keys [db logger]}]
  (fn [{{{:keys [topic-type topic-id] :as path} :path body :body} :parameters
        user :user}]
    (try
      (let [authorized? (some? (res-permission/get-resource-if-allowed (:spec db)
                                                                       user
                                                                       (handler.util/get-internal-topic-type topic-type)
                                                                       topic-id
                                                                       {:read? false}))]
        (if authorized?
          (let [conn (:spec db)
                resource-col (keyword (str topic-type translation-entity-id-sufix))
                {:keys [languages translations translatable_fields]} body
                db-res-translations (when (seq translations)
                                      (sql-util/entity-col->persistence-entity-col
                                       translations
                                       :insert-keys
                                       [:language :translatable_field]))
                result (db.res-translation/delete-resource-translations
                        conn
                        {:table (str topic-type translation-table-sufix)
                         :resource-col (name resource-col)
                         :filters (merge {:resource-id topic-id}
                                         (when (and (seq db-res-translations)
                                                    (not (seq languages))
                                                    (not (seq translatable_fields)))
                                           {:translations db-res-translations})
                                         (when (and languages
                                                    (not (seq translations)))
                                           {:languages languages})
                                         (when (and translatable_fields
                                                    (not (seq translations)))
                                           {:translatable_fields translatable_fields}))})]
            (if (> (first result) 0)
              (resp/response {})
              {:status 500
               :body {:success? false
                      :reason :no-translations-deleted}}))
          handler.util/unauthorized))
      (catch Exception e
        (log logger :error ::failed-to-delete-resource-translations {:exception-message (.getMessage e)
                                                                     :context-data {:path-params path
                                                                                    :body-params body}})
        (let [response {:status 500
                        :body {:success? false
                               :reason :failed-to-delete-resource-translations}}]
          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(defmethod ig/init-key :gpml.handler.resource.translation/get
  [_ {:keys [db logger] :as config}]
  (fn [{{:keys [path query]} :parameters user :user}]
    (try
      (let [conn (:spec db)
            topic-type (:topic-type path)
            resource-col (keyword (str topic-type translation-entity-id-sufix))
            topic-id (:topic-id path)
            langs-only? (:langs-only query)
            resource (db.resource.detail/get-resource (:spec db)
                                                      {:table-name topic-type
                                                       :id topic-id})
            draft? (not= "APPROVED" (:review_status resource))
            authorized? (if draft?
                          (res-permission/operation-allowed?
                           config
                           {:user-id (:id user)
                            :entity-type topic-type
                            :entity-id topic-id
                            :operation-type :read-draft})
                          true)]
        (if authorized?
          (let [table-name (str topic-type translation-table-sufix)
                result (if langs-only?
                         (->> (db.res-translation/get-resource-translation-langs
                               conn
                               {:table table-name
                                :resource-col (name resource-col)
                                :filters {:resource-id topic-id}})
                              (mapv :language))
                         (->> (db.res-translation/get-resource-translations
                               conn
                               {:table table-name
                                :resource-col (name resource-col)
                                :filters {:resource-id topic-id}})
                              (group-by :translatable_field)
                              (reduce (fn [translations-acc [field-key field-value]]
                                        (assoc
                                         translations-acc
                                         field-key
                                         (-> field-value first :translations)))
                                      {})))]
            (resp/response result))
          handler.util/unauthorized))
      (catch Exception e
        (log logger :error ::failed-to-get-resource-translations {:exception-message (.getMessage e)
                                                                  :context-data {:path-params path
                                                                                 :user user}})
        (let [response {:status 500
                        :body {:success? false
                               :reason :failed-to-get-resource-translations}}]
          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))
