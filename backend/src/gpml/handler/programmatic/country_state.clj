(ns gpml.handler.programmatic.country-state
  (:require [clojure.data.csv :as csv]
            [clojure.java.io :as io]
            [clojure.set :as set]
            [duct.logger :refer [log]]
            [gpml.db.country :as db.country]
            [gpml.db.country-state :as db.country-state]
            [gpml.handler.responses :as r]
            [gpml.util.csv :as util.csv]
            [gpml.util.sql :as util.sql]
            [integrant.core :as ig]
            [malli.core :as m]
            [malli.transform :as mt]
            [reitit.ring.malli :as ring.malli]))

(def country-state-csv-schema
  [:sequential
   [:map
    [:name [string? {:min 1}]]
    [:country_code [string? {:min 1}]]
    [:state_code [string? {:min 1}]]
    [:type {:optional true} [string? {:min 1}]]]])

(defn- create-country-states
  [{:keys [db logger]}
   {{{{:keys [tempfile]} :file} :multipart} :parameters}]
  (try
    (with-open [reader (io/reader tempfile)]
      (let [country-states-csv (m/decode country-state-csv-schema
                                         (->> reader
                                              csv/read-csv
                                              util.csv/csv-data->maps)
                                         mt/strip-extra-keys-transformer)]
        (if (m/validate country-state-csv-schema country-states-csv)
          (let [countries (group-by :iso_code_a2 (db.country/get-countries (:spec db) {}))
                xform (comp (map #(-> %
                                      (assoc :country_id (get-in countries [(:country_code %) 0 :id]))
                                      (dissoc :country_code)
                                      (set/rename-keys {:state_code :code})))
                            (remove (comp not :country_id)))
                country-states (into [] xform country-states-csv)
                insert-cols (util.sql/get-insert-columns-from-entity-col country-states)
                insert-values (util.sql/entity-col->persistence-entity-col country-states)
                inserted-values (db.country-state/create-country-states (:spec db) {:insert-cols insert-cols
                                                                                    :insert-values insert-values})]
            (if (= inserted-values (count country-states))
              (r/ok {:success? true
                     :inserted-values inserted-values})
              (r/server-error {:success? false
                               :reason :failed-to-import-country-states
                               :error-details {:expected (count country-states)
                                               :actual inserted-values}})))
          (r/bad-request {:success? false
                          :reason :invalid-parameter-type
                          :error-details (m/explain country-state-csv-schema country-states-csv)}))))
    (catch Exception e
      (log logger :error ::failed-to-import-country-states {:exception-message (ex-message e)})
      (r/server-error {:success? false
                       :reason :failed-to-import-country-states
                       :error-details {:exception-message (ex-message e)
                                       :exception-type (class e)}}))))

(defmethod ig/init-key :gpml.handler.programmatic.country-state/post
  [_ config]
  (fn [req]
    (create-country-states config req)))

(defmethod ig/init-key :gpml.handler.programmatic.country-state/post-params
  [_ _]
  {:multipart [:map [:file ring.malli/temp-file-part]]})
