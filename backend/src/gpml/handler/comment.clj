(ns gpml.handler.comment
  (:require [clojure.string :as str]
            [gpml.db.comment :as db.comment]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.stakeholder-association :as db.stakeholder-association]
            [gpml.domain.types :as dom.types]
            [gpml.util :as util]
            [gpml.util.email :as email]
            [gpml.util.regular-expressions :as util.regex]
            [integrant.core :as ig]
            [java-time :as time]
            [java-time.pre-java8 :as time-pre-j8]
            [java-time.temporal]
            [ring.util.response :as resp]))

(def ^:const id-param
  [:id
   {:optional false
    :swagger {:description "The comment's ID"
              :type "string"
              :format "uuid"
              :allowEmptyValue false}}
   [:or
    [:re util.regex/uuid-regex]
    [:fn uuid?]]])

(def ^:const author-id-param
  [:author_id
   {:optional false
    :swagger {:description "The comment's author ID"
              :type "integer"
              :allowEmptyValue false}}
   [:fn pos-int?]])

(def ^:const parent-id-param
  [:parent_id
   {:optional true
    :swagger {:description "The comment's parent ID if there is any"
              :type "string"
              :format "uuid"
              :allowEmptyValue false}}
   [:or
    [:re util.regex/uuid-regex]
    [:fn uuid?]
    [:fn nil?]]])

(def ^:const resource-id-param
  [:resource_id
   {:optional false
    :swagger {:description "The resource ID"
              :type "integer"
              :allowEmptyValue false}}
   [:fn pos-int?]])

(def ^:const resource-type-param
  [:resource_type
   {:optional false
    :swagger {:description "The resource type the user commented on."
              :type "string"
              :enum dom.types/resources-types
              :allowEmptyValue false}}
   (apply conj [:enum] dom.types/resources-types)])

(def ^:const title-param
  [:title
   {:optional true
    :swagger {:description "The title of the comment"
              :type "string"
              :allowEmptyValue false}}
   [:maybe [:fn util/non-blank-string?]]])

(def ^:const content-param
  [:content
   {:optional false
    :swagger {:description "The content of the comment"
              :type "string"
              :allowEmptyValue false}}
   [:fn util/non-blank-string?]])

(def ^:const comment-schema
  [:map
   id-param
   author-id-param
   parent-id-param
   resource-id-param
   resource-type-param
   title-param
   content-param])

(def ^:const create-comment-params
  [:map
   author-id-param
   parent-id-param
   resource-id-param
   resource-type-param
   title-param
   content-param])

(def ^:const create-comment-response
  [:map
   [:comment comment-schema]])

(def ^:const get-resource-comments-params
  [:map
   (assoc resource-id-param 2 [:fn util/str-number?])
   resource-type-param])

(def ^:const get-resource-comments-response
  [:map
   [:comments [:maybe [:vector comment-schema]]]])

(def ^:const update-comment-params
  [:map
   id-param
   (assoc-in title-param [1 :optional] true)
   (assoc-in content-param [1 :optional] true)])

(def ^:const update-comment-response
  [:map
   [:updated-comments {:swagger {:description "Number of updated comments"
                                 :type "integer"}}
    [:int {:min 0}]]])

(def ^:const delete-comment-params
  [:map
   id-param])

(def ^:const delete-comment-response
  [:map
   [:deleted-comments {:swagger {:description "Number of deleted comments"
                                 :type "integer"}}
    [:int {:min 0}]]])

(defn- api-comment->comment
  [api-comment]
  (-> api-comment
      (util/replace-in-keys #"_" "-")
      (update :id (fn [id] (if id (util/uuid id) (util/uuid))))
      (assoc :updated-at (time-pre-j8/sql-timestamp (time/instant) "UTC"))
      (util/update-if-not-nil :parent-id util/uuid)))

(defn- comment->api-comment
  [comment]
  (-> comment
      (update :created_at time/to-millis-from-epoch)
      (update :updated_at time/to-millis-from-epoch)))

(defn- api-opts->opts
  [api-opts]
  (-> api-opts
      (util/replace-in-keys #"_" "-")
      (util/update-if-not-nil :resource-id #(Integer/parseInt %))))

(defn- send-new-comment-created-notification
  [{:keys [db mailjet-config]} {:keys [resource-id resource-type author-id]}]
  (let [resource-type (if (some #{resource-type} ["financing_resource" "action_plan" "technical_resource"])
                        "resource"
                        resource-type)
        stakeholder-resource-association
        (first (db.stakeholder-association/get-stakeholder-resource-association (:spec db) {:resource-type resource-type
                                                                                            :resource-id resource-id
                                                                                            :association "owner"}))]
    (when (and (seq stakeholder-resource-association)
               ;; NOTE: we don't want to send email notifications if
               ;; the owner of the resource reply (meaning it's the
               ;; author of the comment) to a comment on its resource.
               (not= author-id (:stakeholder stakeholder-resource-association)))
      (let [{:keys [resource]} stakeholder-resource-association
            comment-author (db.stakeholder/get-stakeholder-by-id (:spec db) {:id author-id})
            resource-owner (db.stakeholder/get-stakeholder-by-id (:spec db)
                                                                 {:id (:stakeholder stakeholder-resource-association)})
            comment-author-full-name (email/get-user-full-name comment-author)
            resource-owner-full-name (email/get-user-full-name resource-owner)
            resource-title-or-name (or (:title resource) (:name resource))]
        (email/send-email mailjet-config
                          email/unep-sender
                          (email/new-resource-comment-subject comment-author-full-name)
                          [{:Name resource-owner-full-name :Email (:email resource-owner)}]
                          [(email/new-resource-comment-text resource-owner-full-name
                                                            comment-author-full-name
                                                            resource-title-or-name
                                                            (:app-domain mailjet-config))]
                          [])))))

(defn- create-comment
  [{:keys [db] :as config} req]
  (let [body-params (get-in req [:parameters :body])
        comment (api-comment->comment body-params)
        result (comment->api-comment (db.comment/create-comment (:spec db) comment))]
    (when (seq result)
      (future (send-new-comment-created-notification config comment)))
    {:comment result}))

(defn- get-resource-comments
  [{:keys [db]} {{:keys [query]} :parameters :as _req}]
  (let [opts (api-opts->opts query)
        comments (db.comment/get-resource-comments (:spec db) opts)]
    {:comments (-> (map comment->api-comment comments)
                   (util/build-hierarchy {} :parent_id)
                   :children)}))

(defn- update-comment
  [{:keys [db]} req]
  (let [body-params (get-in req [:parameters :body])
        comment (api-comment->comment body-params)]
    {:updated-comments (db.comment/update-comment (:spec db) comment)}))

(defn- delete-comment
  [{:keys [db]} {{{:keys [id]} :path} :parameters :as _req}]
  {:deleted-comments (db.comment/delete-comment (:spec db) {:id (util/uuid id)})})

(defmethod ig/init-key :gpml.handler.comment/post [_ config]
  (fn [req]
    (resp/response (create-comment config req))))

(defmethod ig/init-key :gpml.handler.comment/get [_ config]
  (fn [req]
    (resp/response (get-resource-comments config req))))

(defmethod ig/init-key :gpml.handler.comment/put [_ config]
  (fn [req]
    (resp/response (update-comment config req))))

(defmethod ig/init-key :gpml.handler.comment/delete [_ config]
  (fn [req]
    (resp/response (delete-comment config req))))

(defmethod ig/init-key :gpml.handler.comment/post-params [_ _]
  {:body create-comment-params})

(defmethod ig/init-key :gpml.handler.comment/get-params [_ _]
  {:query get-resource-comments-params})

(defmethod ig/init-key :gpml.handler.comment/put-params [_ _]
  {:body update-comment-params})

(defmethod ig/init-key :gpml.handler.comment/delete-params [_ _]
  {:path delete-comment-params})

(defmethod ig/init-key :gpml.handler.comment/post-response [_ _]
  {200 {:body create-comment-response}})

(defmethod ig/init-key :gpml.handler.comment/get-response [_ _]
  {200 {:body get-resource-comments-response}})

(defmethod ig/init-key :gpml.handler.comment/put-response [_ _]
  {200 {:body update-comment-response}})

(defmethod ig/init-key :gpml.handler.comment/delete-response [_ _]
  {200 {:body delete-comment-response}})
