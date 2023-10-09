(ns gpml.handler.tag
  (:require [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.tag :as db.tag]
            [gpml.domain.tag :as dom.tag]
            [gpml.domain.types :as dom.types]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.service.permissions :as srv.permissions]
            [gpml.util :as util]
            [gpml.util.malli :as util.malli]
            [integrant.core :as ig]
            [malli.util :as mu]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(def ^:const get-popular-topics-tags-params
  [:map
   [:tags
    {:optional true
     :swagger {:description "A comma separated list of tag names."
               :type "string"
               :allowEmptyValue true}}
    [:string {:min 1}]]
   [:limit
    {:optional true
     :default 20
     :swagger {:description "Limit the number of popular topic tags results"
               :type "integer"
               :allowEmptyValue true}}
    [:int {:min 0}]]])

(def ^:const put-params
  [:map
   [:id
    {:optional false
     :swagger {:description "The tag's ID"
               :type "integer"
               :allowEmptyValue true}}
    [:fn pos-int?]]
   [:private
    {:optional true
     :swagger {:description "Boolean to set if a tag is private"
               :type "boolean"
               :allowEmptyValue false}}
    [:boolean]]
   [:tag_category
    {:optional true
     :swagger {:description "The tag's category. It must exist."
               :type "integer"
               :allowEmptyValue false}}
    [:fn pos-int?]]
   [:reviewed_by
    {:optional true
     :swagger {:description "The tag's reviewer ID."
               :type "integer"
               :allowEmptyValue true}}
    [:fn pos-int?]]
   [:review_status
    {:optional true
     :swagger
     {:description "Review status of the Tag"
      :type "string"
      :enum dom.types/review-statuses}}
    (apply conj [:enum] dom.types/review-statuses)]
   [:definition
    {:optional true
     :swagger {:description "Brief definition about the tag"
               :type "string"
               :allowEmptyValue true}}
    [:string {:min 1}]]
   [:ontology_ref_link
    {:optional true
     :swagger {:description "Link to the tag's ontology"
               :type "string"
               :allowEmptyValue true}}
    [:string {:min 1}]]])

(def ^:const put-response
  [:map
   [:updated-tags
    {:swagger {:description "Number of updated tags"
               :type "integer"}}
    [:int {:min 0}]]])

(defn create-tags
  "Creates N `tags` given a `tag-category`. `tags` are expected to have
  to have the following structure:
  - `[{:tag \"some tag\"} . . .]`
  In the case the tag existed beforehand we check if the related rbac context exist before trying
  to create those contexts, so we create only the ones for the truly new tags.

  If the tag_category cannot be found we throw an exception before going forward.

  `private` property is converted again to a boolean to set it to `false` default value when needed."
  [conn logger tags tag-category]
  (let [tag-category ((comp :id first) (db.tag/get-tag-categories conn {:filters {:categories [tag-category]}}))]
    (if (nil? tag-category)
      (throw (ex-info "Failed to find tag category for creating new tags" {:reason :failed-to-get-tags-category}))
      (let [new-tags (filter (comp not :id) tags)
            tags-to-create (map (fn [{:keys [tag private]}]
                                  (vector tag tag-category (boolean private)))
                                (map #(select-keys % [:tag :private]) new-tags))
            tag-entity-columns ["tag" "tag_category" "private"]
            created-tag-ids (map :id (db.tag/new-tags conn {:tags tags-to-create
                                                            :insert-cols tag-entity-columns}))]
        (doseq [tag-id created-tag-ids
                :let [{:keys [success?]} (srv.permissions/get-resource-context
                                          {:conn conn
                                           :logger logger}
                                          :tag
                                          tag-id)
                      ctx-exists? success?]]
          (when-not ctx-exists?
            (srv.permissions/create-resource-context
             {:conn conn
              :logger logger}
             {:context-type :tag
              :resource-id tag-id})))
        created-tag-ids))))

(defn all-tags
  [db query]
  (reduce-kv (fn [m k v]
               (assoc m k (mapv #(dissoc % :category) v)))
             {}
             (group-by :category (db.tag/all-tags db query))))

(defn- api-opts->opts
  [{:keys [limit tags]}]
  (cond-> {}
    limit
    (assoc :limit limit)

    (seq tags)
    (assoc-in [:filters :tags] (str/split tags #","))))

(defn- update-tag
  [{:keys [db]} req]
  (let [body-params (get-in req [:parameters :body])]
    {:updated-tags (db.tag/update-tag (:spec db) {:id (:id body-params)
                                                  :updates (-> body-params
                                                               (dissoc :id)
                                                               (util/update-if-not-nil :review_status keyword)
                                                               db.tag/tag->db-tag)})}))

(defmethod ig/init-key :gpml.handler.tag/by-topic [_ {:keys [db]}]
  (fn [{{topic-type :topic-type} :path-params}]
    (let [conn (:spec db)
          category (format "%s%%" topic-type)
          category-tags (db.tag/tag-by-category conn {:category category})]
      (resp/response category-tags))))

(defn topics-subset->db-topics-subset [topics query]
  (merge
   query
   (reduce (fn [acc topic]
             (merge acc {(:type topic) (str "(" (str/join "," (:ids topic)) ")")}))
           {} topics)))

(defn- popular-tags [db query]
  (if-not (seq (get-in query [:filters :tags]))
    (db.tag/get-popular-topics-tags db query)
    (let [topics-subset (db.tag/get-popular-topics-tags-subset db (select-keys query [:filters]))
          db-topics-subset (topics-subset->db-topics-subset topics-subset (dissoc query :filters))]
      (db.tag/get-more-popular-topics-tags db db-topics-subset))))

(defmethod ig/init-key :gpml.handler.tag/get-popular-topics-tags
  [_ {:keys [db]}]
  (fn [{{:keys [query]} :parameters}]
    (resp/response (popular-tags (:spec db) (api-opts->opts query)))))

(defmethod ig/init-key :gpml.handler.tag/all [_ {:keys [db]}]
  (fn [{{:keys [query]} :parameters}]
    (resp/response (all-tags (:spec db) query))))

(defmethod ig/init-key :gpml.handler.tag/put
  [_ config]
  (fn [{:keys [user] :as req}]
    (if (h.r.permission/super-admin? config (:id user))
      (resp/response (update-tag config req))
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.tag/put-params
  [_ _]
  {:body put-params})

(defmethod ig/init-key :gpml.handler.tag/get-popular-topics-tags-params
  [_ _]
  {:query get-popular-topics-tags-params})

(defmethod ig/init-key :gpml.handler.tag/put-response
  [_ _]
  {200 {:body put-response}})

(defn- create-tag
  [{:keys [db logger]} tag]
  (first (create-tags (:spec db) logger [tag] (:tag_category tag))))

(defmethod ig/init-key :gpml.handler.tag/post
  [_ {:keys [logger] :as config}]
  (fn [{:keys [parameters user]}]
    (try
      (if (h.r.permission/super-admin? config (:id user))
        (r/ok {:success? true
               :id (create-tag config (:body parameters))})
        (r/forbidden {:message "Unauthorized"}))
      (catch Throwable t
        (let [reason (or (:reason (ex-data t)) :could-not-create-tag)
              response {:success? false
                        :reason reason}]
          (log logger :error ::failed-to-create-tag {:exception-message (.getMessage t)
                                                     :reason reason})
          (if (instance? SQLException t)
            (r/server-error response)
            (r/server-error (assoc-in response [:error-details :error] (.getMessage t)))))))))

(defmethod ig/init-key :gpml.handler.tag/post-params
  [_ _]
  {:body (-> dom.tag/Tag
             (util.malli/dissoc [:id])
             (mu/assoc
              :tag_category
              [string?
               {:swagger {:description "The name of the Tag's category it belongs to."
                          :type "string"}}]))})

(def ^:private get-all-query-params
  [:map
   [:private {:optional true}
    boolean?]])

(defmethod ig/init-key :gpml.handler.tag/get-all-query-params [_ _]
  get-all-query-params)
