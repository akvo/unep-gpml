(ns gpml.handler.image
  (:require [clj-gcp.storage.core :as sut]
            [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.boundary.port.storage-client :as storage-client]
            [gpml.db.event :as db.event]
            [gpml.db.organisation :as db.organisation]
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
  "Given a image URL, we try to download it, returning a response as byte output stream.
   The request needs to be provided with the user-agent, since some image repositories need it.

   In order to allow proper image recognition and caching, we provide also content-type and cache-control related
   headers in the response back."
  [req logger img-url]
  (let [user-agent (get-in req [:headers "user-agent"])
        {:keys [status headers body] :as result} (http-client/do-request
                                                  logger
                                                  {:method :get
                                                   :url img-url
                                                   :as :byte-array
                                                   :headers {:user-agent user-agent}}
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

;; We try to provide the image with a given `id`, looking into the source related to its `type`.
;; We try to catch any exception to be sure we return a consistent response and we log any error that happen, not
;; covered by the usual flow.
(defmethod ig/init-key :gpml.handler.image/get [_ {:keys [logger db]}]
  (fn [{{{:keys [id image_type]} :path} :parameters :as req}]
    (try
      (if-let [data (cond
                      (= image_type "profile")
                      (:picture (db.stakeholder/stakeholder-image-by-id (:spec db) {:id id}))

                      (= image_type "event")
                      (:image (db.event/event-image-by-id (:spec db) {:id id}))

                      (= image_type "organisation")
                      (:logo (first (db.organisation/get-organisations (:spec db) {:filters {:id id}})))
                      :else nil)]
        (cond
          ;; We check first if what we get from the DB is a valid URL, so we download the image in that case from
          ;; the URL, in order to return it in the same format for FE as in other cases: byte output stream.
          (util/try-url-str data)
          (handle-img-resp-from-url req logger data)

          ;; In case the data is not a URL, we check if it's a valid Base64-encoded image in order to parse it like
          ;; so and return a byte array output stream to FE, keeping same format the other cases.
          (and
           (seq data)
           (seq (util/base64-headless data))
           (util/base64? (util/base64-headless data)))
          (get-content data)

          ;; If the data is not a valid URL or a Base64-encoded image, that means that we could not get it right
          ;; or has a invalid format, as an empty string.
          :else
          (do
            (log logger :error ::could-not-fetch-url {:data data
                                                      :id id
                                                      :image-type image_type})
            (resp/not-found {:message "Image not found (could not fetch the url)"})))
        (resp/not-found {:message "Image not found"}))
      (catch Throwable e
        (let [error-details {:error-code (class e)
                             :message (.getMessage e)}]
          (log logger :error ::could-not-get-image error-details)
          (resp/not-found {:message "Image not found (an error happened)"}))))))
