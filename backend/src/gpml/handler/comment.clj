(ns gpml.handler.comment
  (:require
   [clojure.string :as str]
   [gpml.db.comment :as db.comment]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.db.stakeholder-association :as db.stakeholder-association]
   [gpml.email-util :as email]
   [gpml.util :as util]
   [gpml.util.regular-expressions :as util.regex]
   [integrant.core :as ig]
   [java-time :as time]
   [java-time.pre-java8 :as time-pre-j8]
   [java-time.temporal]
   [ring.util.response :as resp]))

(def ^:const resource-types
  [:policy :event :financing_resource :technical_resource :action_plan :initiative :technology])

(def ^:const id-param
  [:id
   {:optional false
    :swagger {:description "The comment's ID"
              :type "uuid"
              :allowEmptyValue false}}
   [:re util.regex/uuid-regex]])

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
    :swagger {:description (str "One of the following resource types: " (str/join "," (map name resource-types)))
              :type "string"
              :allowEmptyValue false}}
   (vec (cons :enum (mapv name resource-types)))])

(def ^:const title-param
  [:title
   {:optional false
    :swagger {:description "The title of the comment"
              :type "string"
              :allowEmptyValue false}}
   [:fn util/non-blank-string?]])

(def ^:const content-param
  [:content
   {:optional false
    :swagger {:description "The content of the comment"
              :type "string"
              :allowEmptyValue false}}
   [:fn util/non-blank-string?]])

(def ^:const create-comment-params
  [:map
   [:author_id
    {:optional false
     :swagger {:description "The comment's author ID"
               :type "integer"
               :allowEmptyValue false}}
    [:fn pos-int?]]
   [:parent_id
    {:optional true
     :swagger {:description "The comment's parent ID if there is any"
               :type "uuid"
               :allowEmptyValue false}}
    [:re util.regex/uuid-regex]]
   resource-id-param
   resource-type-param
   title-param
   content-param])

(def ^:const get-resource-comments-params
  [:map
   (assoc resource-id-param 2 [:fn util/str-number?])
   resource-type-param])

(def ^:const update-comment-params
  [:map
   id-param
   (assoc-in title-param [1 :optional] true)
   (assoc-in content-param [1 :optional] true)])

(def ^:const delete-comment-params
  [:map
   id-param])

(defn- api-comment->comment
  [api-comment]
  (-> api-comment
      (util/replace-in-keys #"_" "-")
      (update :id (fn [id] (if id (util/uuid id) (util/uuid))))
      (assoc :updated-at (time-pre-j8/sql-timestamp (time/instant) "UTC"))
      (util/update-if-exists :parent-id util/uuid)))

(defn- comment->api-comment
  [comment]
  (-> comment
      (update :created_at time/to-millis-from-epoch)
      (update :updated_at time/to-millis-from-epoch)))

(defn- api-opts->opts
  [api-opts]
  (-> api-opts
      (util/replace-in-keys #"_" "-")
      (util/update-if-exists :resource-id #(Integer/parseInt %))))

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
