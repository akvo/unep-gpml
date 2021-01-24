(ns gpml.handler.tag
  (:require [gpml.db.tag :as db.tag]
            [integrant.core :as ig]
            [ring.util.response :as resp]))


(defmethod ig/init-key :gpml.handler.tag/get [_ {:keys [db]}]
  (fn [{{topic-type :topic-type} :path-params}]
    (let [conn (:spec db)
          category (format "%s%%" topic-type)
          category-tags (db.tag/tag-by-category conn {:category category})]
      (resp/response category-tags))))
