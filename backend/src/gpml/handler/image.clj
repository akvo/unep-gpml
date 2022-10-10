(ns gpml.handler.image
  (:require [clj-gcp.storage.core :as sut]
            [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.boundary.port.storage-client :as storage-client]
            [gpml.db.event :as db.event]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.util :as util]
            [gpml.util.http-client :as http-client]
            [integrant.core :as ig]
            [medley.core :as m]
            [ring.util.response :as resp])
  (:import java.io.ByteArrayInputStream
           java.nio.ByteBuffer
           java.util.Base64))

(defn b64-image-to-byte-stream [data]
  (let [[_ ^String content-type ^String b64image] (re-find #"^data:(\S+);base64,(.*)$" data)
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

(defn delete-blob
  [{:keys [storage-client-adapter storage-bucket-name]} blob-name]
  (storage-client/delete-blob storage-client-adapter
                              storage-bucket-name
                              blob-name))

(defn upload-blob
  [{:keys [storage-client-adapter storage-bucket-name]} blob-name bytes content-type]
  (with-open [out (sut/blob-writer storage-client-adapter
                                   storage-bucket-name
                                   blob-name
                                   {:contentType content-type})]
    (.write out bytes)))

(defn upload-b64image
  [{:keys [storage-bucket-name] :as config} b64image resource-name]
  (let [{:keys [byte-stream content-type]} (b64-image-to-byte-stream b64image)
        file-ext (nth (str/split content-type #"/") 1)
        blob-name (format "images/%s-%s-uploaded.%s" resource-name (m/random-uuid) file-ext)]
    (upload-blob config
                 blob-name
                 (ByteBuffer/wrap (.readAllBytes byte-stream))
                 content-type)
    (format "https://storage.googleapis.com/%s/%s" storage-bucket-name blob-name)))

(defn assoc-image
  [config conn image image-type]
  (cond
    (nil? image) nil

    ;; Ignore if image is already uploaded (profile, event)
    (re-find #"^\/image\/" image) image

    ;; Ignore if image is uploaded to GCS (resources other than profile, event)
    (re-find #"^\/images\/" image) image

    ;; For all topics other than profile and event upload to GCS
    (not (contains? #{"profile" "event"} image-type))
    (upload-b64image config image image-type)

    ;; Use _data DB table
    :else (let [topic-image (cond (= image-type "profile")
                                  (db.stakeholder/new-stakeholder-image conn {:picture image})
                                  (= image-type "event")
                                  (db.event/new-event-image conn {:image image})
                                  :else nil)]
            (str/join ["/image/" image-type "/" (:id topic-image)]))))

(defn- handle-img-resp-from-url
  [logger img-url]
  (let [{:keys [status headers body] :as result} (http-client/do-request logger
                                                                         {:method :get
                                                                          :url img-url
                                                                          :as :byte-array}
                                                                         {})]
    (if (and status
             (<= 200 status 299))
      (-> body
          (resp/response)
          (resp/content-type (get headers "Content-Type"))
          (resp/header "Cache-Control" "public,max-age:60"))
      (do
        (log logger :error ::could-not-fetch-image {:status status
                                                    :reason-phrase (:reason-phrase result)})
        (resp/not-found {:message "Image not found (could not download the image)"})))))

(defmethod ig/init-key :gpml.handler.image/get [_ {:keys [logger db]}]
  (fn [{{{:keys [id image_type]} :path} :parameters}]
    (if-let [data (cond
                    (= image_type "profile")
                    (:picture (db.stakeholder/stakeholder-image-by-id (:spec db) {:id id}))
                    (= image_type "event")
                    (:image (db.event/event-image-by-id (:spec db) {:id id}))
                    :else nil)]
      (cond (util/try-url-str data)
            (handle-img-resp-from-url logger data)

            (and
             (seq data)
             (seq (util/base64-headless data))
             (util/base64? (util/base64-headless data)))
            (get-content data)

            :else
            (do
              (log logger :error ::could-not-fetch-url {:data data
                                                        :id id
                                                        :image-type image_type})
              (resp/not-found {:message "Image not found (could not fetch the url)"})))
      (resp/not-found {:message "Image not found"}))))
