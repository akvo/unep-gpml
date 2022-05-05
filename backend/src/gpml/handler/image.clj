(ns gpml.handler.image
  (:require [integrant.core :as ig]
            [clojure.string :as str]
            [gpml.constants :as constants]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.db.event :as db.event]
            [ring.util.response :as resp]
            [clj-gcp.storage.core :as sut]
            [medley.core :as m])

  (:import java.util.Base64
           java.io.ByteArrayInputStream
           java.nio.ByteBuffer))

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

(defn upload-blob [bucket-name blob-name bytes content-type]
  (let [sut (sut/->gcs-storage-client)]
    (with-open [out (sut/blob-writer sut
                                     bucket-name
                                     blob-name
                                     {:contentType content-type})]
      (.write out bytes))))

(defn upload-b64image [bucket-name b64image resource-name]
  (let [{:keys [byte-stream content-type]} (b64-image-to-byte-stream b64image)
        file-ext (nth (str/split content-type #"/") 1)
        blob-name (format "images/%s-%s-uploaded.%s" resource-name (m/random-uuid) file-ext)]
    (upload-blob constants/gcs-bucket-name
                 blob-name
                 (ByteBuffer/wrap (.readAllBytes byte-stream))
                 content-type)
    (format "https://storage.googleapis.com/%s/%s" bucket-name blob-name)))

(defn assoc-image [conn image image-type]
  (cond
    (nil? image) nil

    ;; Ignore if image is already uploaded (profile, event)
    (re-find #"^\/image\/" image) image

    ;; Ignore if image is uploaded to GCS (resources other than profile, event)
    (re-find #"^\/images\/" image) image

    ;; For all topics other than profile and event upload to GCS
    (not (contains? #{"profile" "event"} image-type))
    (upload-b64image constants/gcs-bucket-name image image-type)

    ;; Use _data DB table
    :else (let [topic-image (cond (= image-type "profile")
                                  (db.stakeholder/new-stakeholder-image conn {:picture image})
                                  (= image-type "event")
                                  (db.event/new-event-image conn {:image image})
                                  :else nil)]
            (str/join ["/image/" image-type "/" (:id topic-image)]))))

(defmethod ig/init-key :gpml.handler.image/get [_ {:keys [db]}]
  (fn [{{{:keys [id image_type]} :path} :parameters}]
    (if-let [data (cond
                    (= image_type "profile")
                    (:picture (db.stakeholder/stakeholder-image-by-id (:spec db) {:id id}))
                    (= image_type "event")
                    (:image (db.event/event-image-by-id (:spec db) {:id id}))
                    :else nil)]
      (get-content data)
      (resp/not-found {:message "Image not found"}))))
