(ns gpml.handler.image
  (:require [integrant.core :as ig]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.event-image :as db.event-image]
            [ring.util.response :as resp])
  (:import java.util.Base64
           java.io.ByteArrayInputStream))

(defn get-content [data]
  (let [[_ content-type b64image] (re-find #"^data:(\S+);base64,(.*)$" data)
        decoder (Base64/getDecoder)]
    (-> (.decode decoder b64image)
        (ByteArrayInputStream.)
        (resp/response)
        (resp/content-type content-type)
        (resp/header "Cache-Control" "public,max-age:60"))))

(defmethod ig/init-key :gpml.handler.image/profile [_ {:keys [db]}]
  (fn [{{{:keys [id]} :path} :parameters}]
    (if-let [data (:picture (db.stakeholder/stakeholder-picture-by-id (:spec db) {:id id}))]
        (get-content data)
        (resp/not-found {:message "Image not found"}))))

(defmethod ig/init-key :gpml.handler.image/event [_ {:keys [db]}]
  (fn [{{{:keys [id]} :path} :parameters}]
    (if-let [data (:image (db.event-image/event-image-by-id (:spec db) {:id id}))]
        (get-content data)
        (resp/not-found {:message "Image not found"}))))
