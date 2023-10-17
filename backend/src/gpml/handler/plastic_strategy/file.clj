(ns gpml.handler.plastic-strategy.file
  (:require [camel-snake-kebab.core :refer [->kebab-case ->snake_case]]
            [camel-snake-kebab.extras :as cske]
            [clojure.string :as str]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.service.plastic-strategy :as srv.ps]
            [gpml.service.plastic-strategy.file :as srv.ps.file]
            [gpml.util :as util]
            [integrant.core :as ig]
            [malli.util :as mu]))

(def ^:private common-ps-file-path-params-schema
  [:map
   [:iso_code_a2
    {:swagger {:description "The country ISO Code Alpha 2."
               :type "string"}}
    [:string {:decode/string str/upper-case
              :max 2}]]])

(def ^:private create-ps-file-body-params-schema
  [:map
   [:section_key
    {:swagger {:description "The plastic strategy section identifier where the file is uploaded."
               :type "string"
               :allowEmptyValue false}}
    [:string {:min 1}]]
   [:content
    {:swagger {:description "The file content in base64 string format."
               :type "string"
               :format "byte"}}
    [:fn (comp util/base64? util/base64-headless)]]])

(def ^:private delete-ps-file-body-params-schema
  (mu/union
   (mu/select-keys create-ps-file-body-params-schema [:section_key])
   [:map
    [:file_id
     {:swagger {:description "The file identifier."
                :type "string"
                :format "uuid"}}
     [:uuid]]]))

(def ^:private get-ps-files-query-params-schema
  (mu/optional-keys (mu/select-keys create-ps-file-body-params-schema [:section_key])))

(defn- create-ps-file
  [config {:keys [user] {:keys [path body]} :parameters :as _req}]
  (let [country-iso-code-a2 (:iso_code_a2 path)
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
                                                  :custom-permission :create-file
                                                  :root-context? false})
        (r/forbidden {:message "Unauthorized"})
        (let [body-params (-> (cske/transform-keys ->kebab-case body)
                              (assoc :plastic-strategy-id (:id plastic-strategy)))
              result (srv.ps.file/create-ps-file config
                                                 body-params)]
          (if (:success? result)
            (r/ok {:file_id (get-in result [:ps-file :file-id])})
            (r/server-error (dissoc result :success?))))))))

(defn- delete-ps-file
  [config {:keys [user] {:keys [path body]} :parameters :as _req}]
  (let [country-iso-code-a2 (:iso_code_a2 path)
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
                                                  :custom-permission :delete-file
                                                  :root-context? false})
        (r/forbidden {:message "Unauthorized"})
        (let [body-params (-> (cske/transform-keys ->kebab-case body)
                              (assoc :plastic-strategy-id (:id plastic-strategy)))
              result (srv.ps.file/delete-ps-file config
                                                 body-params)]
          (if (:success? result)
            (r/ok {})
            (r/server-error (dissoc result :success?))))))))

(defn- get-ps-files
  [config {:keys [user] {:keys [path body]} :parameters :as _req}]
  (let [country-iso-code-a2 (:iso_code_a2 path)
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
                                                  :custom-permission :list-files
                                                  :root-context? false})
        (r/forbidden {:message "Unauthorized"})
        (let [search-opts {:filters (cond-> {:plastic-strategies-ids [(:id plastic-strategy)]}
                                      (:section_key body)
                                      (assoc :sections-keys [(:section_key body)]))}
              result (srv.ps.file/get-ps-files config
                                               search-opts)]
          (if (:success? result)
            (r/ok (cske/transform-keys ->snake_case (:ps-files result)))
            (r/server-error (dissoc result :success?))))))))

(defmethod ig/init-key :gpml.handler.plastic-strategy.file/post
  [_ config]
  (fn [req]
    (create-ps-file config req)))

(defmethod ig/init-key :gpml.handler.plastic-strategy.file/post-params
  [_ _]
  {:path common-ps-file-path-params-schema
   :body create-ps-file-body-params-schema})

(defmethod ig/init-key :gpml.handler.plastic-strategy.file/delete
  [_ config]
  (fn [req]
    (delete-ps-file config req)))

(defmethod ig/init-key :gpml.handler.plastic-strategy.file/delete-params
  [_ _]
  {:path common-ps-file-path-params-schema
   :body delete-ps-file-body-params-schema})

(defmethod ig/init-key :gpml.handler.plastic-strategy.file/get
  [_ config]
  (fn [req]
    (get-ps-files config req)))

(defmethod ig/init-key :gpml.handler.plastic-strategy.file/get-params
  [_ _]
  {:path common-ps-file-path-params-schema
   :query get-ps-files-query-params-schema})
