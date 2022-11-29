(ns gpml.handler.programmatic.case-study
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.case-study :as db.case-study]
            [gpml.db.country :as db.country]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.resource.tag :as db.r.tag]
            [gpml.db.tag :as db.tag]
            [gpml.domain.case-study :as dom.case-study]
            [gpml.handler.resource.geo-coverage :as handler.geo-coverage]
            [gpml.handler.responses :as r]
            [gpml.util :as util]
            [gpml.util.malli :as util.malli]
            [gpml.util.sql :as sql-util]
            [integrant.core :as ig]
            [malli.util :as mu]))

(defn- remove-tags-duplicates
  [tags]
  (->> tags
       (group-by str/lower-case)
       vals
       (map first)))

(defn- build-tags-to-create
  [tags stored-tags tag-category-id]
  (let [lowered-case-stored-tags (map (comp str/lower-case :tag) stored-tags)]
    (reduce (fn [tags-to-create tag]
              (if (get (set lowered-case-stored-tags) (str/lower-case tag))
                tags-to-create
                (conj tags-to-create {:tag tag
                                      :tag_category tag-category-id
                                      :review_status :APPROVED})))
            []
            tags)))

(defn- parse-geo-coverage-group-values
  [geo-coverage-group values]
  (->> values
       (map #(get-in geo-coverage-group [% 0 :id]))
       (remove nil?)))

(defn- handle-geo-coverage
  [conn case-study-id geo-coverage-type geo-coverage-values countries country-groups]
  (if (= geo-coverage-type :global)
    {:success? true}
    (let [parsed-geo-coverage-values (->> (str/split geo-coverage-values #",")
                                          (map (comp str/lower-case str/trim)))
          geo-coverage-countries
          (parse-geo-coverage-group-values countries parsed-geo-coverage-values)
          geo-coverage-country-groups
          (parse-geo-coverage-group-values country-groups parsed-geo-coverage-values)]
      (handler.geo-coverage/create-resource-geo-coverage conn
                                                         :case_study
                                                         case-study-id
                                                         geo-coverage-type
                                                         {:countries geo-coverage-countries
                                                          :country-groups geo-coverage-country-groups}))))

(defn- create-entities
  [conn entity-name db-create-fn db-transformer-fn relation? data-coll]
  (let [insert-cols (keys (first data-coll))
        insert-values (->> data-coll
                           (map db-transformer-fn)
                           (sql-util/get-insert-values insert-cols))
        result (db-create-fn conn
                             (merge
                              {:insert-cols (map name insert-cols)
                               :insert-values insert-values}
                              (when relation?
                                {:table (name entity-name)})))]
    (if (= (count result) (count data-coll))
      {:success? true
       :result result}
      {:success? false})))

(defn- handle-tags
  [conn case-study-id tag-values tag-category-id]
  (let [tags (->> (str/split tag-values #",")
                  (map str/trim)
                  (remove-tags-duplicates))]
    (if-not (seq tags)
      {:success? true}
      (let [tags-db-opts {:filters (db.tag/opts->db-opts {:tags tags})}
            stored-tags (db.tag/get-tags conn tags-db-opts)
            tags-to-create (build-tags-to-create tags stored-tags tag-category-id)
            {created-tags-success? :success? created-tags :result}
            (if-not (seq tags-to-create)
              {:success? true}
              (create-entities conn
                               :tag
                               db.tag/create-tags
                               db.tag/tag->db-tag
                               false
                               tags-to-create))
            tag-relations-to-create (map (fn [tag]
                                           {:case_study case-study-id
                                            :tag (:id tag)})
                                         (concat stored-tags created-tags))
            {created-tag-relations-success? :success?}
            (when (seq tag-relations-to-create)
              (create-entities conn
                               :case_study_tag
                               db.r.tag/create-resource-tags-v2
                               identity
                               true
                               tag-relations-to-create))]
        (if (and created-tags-success? created-tag-relations-success?)
          {:success? true}
          {:success? false})))))

(defn- create-case-study
  [conn api-case-study {:keys [countries country-groups tag-category-id]}]
  (let [url (:platform_link api-case-study)
        geo-coverage (:geo_coverage api-case-study)
        [geo-coverage-type geo-coverage-values] (str/split geo-coverage #":\s")
        geo-coverage-type (str/lower-case geo-coverage-type)
        geo-coverage-type (if (= geo-coverage-type "sub-national")
                            :national
                            (keyword geo-coverage-type))
        case-study-schema-keys (util.malli/keys dom.case-study/CaseStudy)
        case-study (apply dissoc
                          (-> api-case-study
                              (select-keys case-study-schema-keys)
                              (assoc :geo_coverage_type geo-coverage-type
                                     :url url
                                     :language :en))
                          dom.case-study/entity-relation-keys)
        db-case-study (db.case-study/case-study->db-case-study case-study)
        insert-cols (sql-util/get-insert-columns-from-entity-col [db-case-study])
        insert-values (sql-util/entity-col->persistence-entity-col [db-case-study])
        case-study-id (-> (db.case-study/create-case-studies conn
                                                             {:insert-cols insert-cols
                                                              :insert-values insert-values})
                          first
                          :id)]
    (when-not (:success? (handle-geo-coverage conn
                                              case-study-id
                                              geo-coverage-type
                                              geo-coverage-values
                                              countries
                                              country-groups))
      (throw (ex-info "Failed to create geo coverage" {:reason :failed-to-create-geo-coverage})))
    (when-not (:success? (handle-tags conn
                                        case-study-id
                                        (:tags api-case-study)
                                        tag-category-id))
        (throw (ex-info "Failed to create tags" {:reason :failed-to-create-tags})))
    {:success? true
     :id case-study-id}))

(defn- create-case-studies
  [{:keys [db logger]} req]
  (try
    (jdbc/with-db-transaction [tx (:spec db)]
      (let [api-case-studies (get-in req [:parameters :body])
            countries (group-by (comp str/lower-case :name) (db.country/get-countries tx))
            country-groups (group-by (comp str/lower-case :name) (db.country-group/get-country-groups tx))
            tag-category-id (->> {:filters {:categories ["general"]}}
                                 (db.tag/get-tag-categories tx)
                                 first
                                 :id)
            results (mapv #(create-case-study tx
                                              %
                                              {:countries countries
                                               :country-groups country-groups
                                               :tag-category-id tag-category-id})
                          api-case-studies)]
        (r/ok {:success? true
               :inserted-values (count results)})))
    (catch Throwable e
      (log logger :error ::failed-to-create-case-studies {:exception-message (ex-message e)
                                                          :exception-class (class e)})
      (r/server-error {:success? false
                       :reason (or (:reason (ex-data e)) :failed-to-create-case-studies)
                       :error-details {:error (ex-message e)}}))))

(defmethod ig/init-key :gpml.handler.programmatic.case-study/post
  [_ config]
  (fn [req]
    (create-case-studies config req)))

(defmethod ig/init-key :gpml.handler.programmatic.case-study/post-params
  [_ _]
  {:body [:sequential (-> dom.case-study/CaseStudy
                          (mu/assoc :tags [:string {:min 1}])
                          (mu/assoc :platform_link [:string {:min 1}])
                          (mu/assoc :geo_coverage [:string {:min 1}])
                          (mu/assoc :image [:and [:string {:min 1}] [:fn util/try-url-str]])
                          (mu/optional-keys))]})
