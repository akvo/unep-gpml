(ns gpml.handler.image
  (:require [integrant.core :as ig]
            [clojure.string :as str]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.event :as db.event]
            [gpml.db.resource :as db.resource]
            [ring.util.response :as resp])
  (:import java.util.Base64
           java.io.ByteArrayInputStream))

(defn b64-image-to-byte-stream [data]
  (let [[_ content-type b64image] (re-find #"^data:(\S+);base64,(.*)$" data)
        decoder (Base64/getDecoder)
        stream (and b64image
                    (-> (.decode decoder b64image)
                        (ByteArrayInputStream.)))]
    {:byte-stream stream :content-type content-type}))

(defn get-content [data]
  (let [{:keys [byte-stream content-type]} (b64-image-to-byte-stream data)]
    (-> byte-stream
        (resp/response)
        (resp/content-type content-type)
        (resp/header "Cache-Control" "public,max-age:60"))))

(defn assoc-image [conn image image-type]
  (cond
    (nil? image) nil
    (re-find #"^\/image\/" image) image
    :else (let [topic-image (cond (= image-type "profile")
                                  (db.stakeholder/new-stakeholder-image conn {:picture image})
                                  (= image-type "event")
                                  (db.event/new-event-image conn {:image image})
                                  (= image-type "resource")
                                  (db.resource/new-resource-image conn {:image image})
                                  :else nil)]
            (str/join ["/image/" image-type "/" (:id topic-image)]))))


(defmethod ig/init-key :gpml.handler.image/get [_ {:keys [db]}]
  (fn [{{{:keys [id image_type]} :path} :parameters}]
    (if-let [data (cond
                    (= image_type "profile")
                    (:picture (db.stakeholder/stakeholder-image-by-id (:spec db) {:id id}))
                    (= image_type "event")
                    (:image (db.event/event-image-by-id (:spec db) {:id id}))
                    (= image_type "resource")
                    (:image (db.resource/resource-image-by-id (:spec db) {:id id}))
                    :else nil)]
        (get-content data)
        (resp/not-found {:message "Image not found"}))))
