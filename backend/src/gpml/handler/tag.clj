(ns gpml.handler.tag
  (:require [clojure.string :as str]
            [gpml.db.tag :as db.tag]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def ^:const review-status [:APPROVED :SUBMITED :REJECTED])

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
   [:tag_category
    {:optional true
     :swagger {:description "The tag's category. It must exist."
               :type "string"
               :allowEmptyValue true}}
    [:string {:min 1}]]
   [:reviewed_by
    {:optional true
     :swagger {:description "The tag's reviewer ID."
               :type "integer"
               :allowEmptyValue true}}
    [:fn pos-int?]]
   [:review_status
    {:optional true
     :swagger {:description (str "The tag's review status. Allowed values: " (str/join "," (map name review-status)))
               :type "string"
               :allowEmptyValue true}}
    (vec (cons :enum review-status))]
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
  - `[{:tag \"some tag\"} . . .]`"
  [conn tags tag-category]
  (let [tag-category ((comp :id first) (db.tag/get-tag-categories conn {:filters {:categories [tag-category]}}))
        new-tags (filter (comp not :id) tags)
        tags-to-create (map #(vector % tag-category) (map :tag new-tags))
        tag-entity-columns ["tag" "tag_category"]]
    (map :id (db.tag/new-tags conn {:tags tags-to-create
                                    :insert-cols tag-entity-columns}))))

(defn all-tags
  [db]
  (reduce-kv (fn [m k v]
               (assoc m k (mapv #(dissoc % :category) v)))
             {}
             (group-by :category (db.tag/all-tags db))))

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
                                                  :updates (dissoc body-params :id)})}))

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
  (fn [_]
    (resp/response (all-tags (:spec db)))))

(defmethod ig/init-key :gpml.handler.tag/put
  [_ config]
  (fn [req]
    (resp/response (update-tag config req))))

(defmethod ig/init-key :gpml.handler.tag/put-params
  [_ _]
  {:body put-params})

(defmethod ig/init-key :gpml.handler.tag/get-popular-topics-tags-params
  [_ _]
  {:query get-popular-topics-tags-params})

(defmethod ig/init-key :gpml.handler.tag/put-response
  [_ _]
  {200 {:body put-response}})
