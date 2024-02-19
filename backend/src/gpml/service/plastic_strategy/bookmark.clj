(ns gpml.service.plastic-strategy.bookmark
  (:require
   [gpml.db.plastic-strategy.bookmark :as db.ps.bookmark]))

(defn handle-ps-bookmark [{:keys [db]} {:keys [bookmark entity-type entity-id plastic-strategy-id section-key]}]
  (let [ps-bookmark-table (keyword (format "plastic_strategy_%s_bookmark" (name entity-type)))
        ps-bookmark-entity-col (keyword (format "%s_id" (name entity-type)))
        ps-bookmark {:ps-bookmark-table ps-bookmark-table
                     :ps-bookmark-entity-col ps-bookmark-entity-col
                     :ps-id plastic-strategy-id
                     :ps-bookmark-entity-id entity-id
                     :section-key section-key
                     :entity-type entity-type}]
    (if bookmark
      (db.ps.bookmark/create-ps-bookmark (:spec db) ps-bookmark)
      (db.ps.bookmark/delete-ps-bookmark (:spec db) ps-bookmark))))
