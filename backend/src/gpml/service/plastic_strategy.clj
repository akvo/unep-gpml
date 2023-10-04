(ns gpml.service.plastic-strategy
  (:require [gpml.db.plastic-strategy :as db.ps]))

(defn get-plastic-strategies
  [{:keys [db]} search-opts]
  (db.ps/get-plastic-strategies (:spec db) search-opts))

(defn get-plastic-strategy
  [{:keys [db]} search-opts]
  (db.ps/get-plastic-strategy (:spec db) search-opts))

(defn update-plastic-strategy
  [{:keys [db] :as config} country-iso-code-a2 {:keys [steps]}]
  (let [search-opts {:filters {:countries-iso-codes-a2 [country-iso-code-a2]}}
        result (get-plastic-strategy config search-opts)]
    (if-not (:success? result)
      result
      (db.ps/update-plastic-strategy (:spec db) {:id (-> result :plastic-strategy :id)
                                                 :updates {:steps steps}}))))
