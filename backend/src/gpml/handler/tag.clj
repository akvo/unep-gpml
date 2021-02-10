(ns gpml.handler.tag
  (:require [gpml.db.tag :as db.tag]
            [integrant.core :as ig]
            [ring.util.response :as resp]))


(defmethod ig/init-key :gpml.handler.tag/by-topic [_ {:keys [db]}]
  (fn [{{topic-type :topic-type} :path-params}]
    (let [conn (:spec db)
          category (format "%s%%" topic-type)
          category-tags (db.tag/tag-by-category conn {:category category})]
      (resp/response category-tags))))

(defn all-tags
  [db]
  (reduce-kv (fn [m k v]
               (assoc m k (mapv #(dissoc % :category) v)))
             {}
             (group-by :category (db.tag/all-tags db))))

(defmethod ig/init-key :gpml.handler.tag/all [_ {:keys [db]}]
  (fn [_]
    (resp/response (all-tags (:spec db)))))
