(ns gpml.handler.file
  (:require [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [ring.util.response :as resp])
  (:import java.io.ByteArrayInputStream
           java.util.Base64))

(defmethod ig/init-key :gpml.handler.file/profile-cv [_ {:keys [db]}]
  (fn [{{{:keys [id]} :path} :parameters :as req}]
    (tap> id)
    (tap> req)
    (let [picture (:cv (db.stakeholder/stakeholder-cv-by-id (:spec db) {:id id}))
          [_ content-type b64image] (re-find #"^data:(\S+);base64,(.*)$" picture)
          decoder (Base64/getDecoder)]
      (-> (.decode decoder b64image)
          (ByteArrayInputStream.)
          (resp/response)
          (resp/content-type content-type)
          (resp/header "Cache-Control" "public,max-age:60")))))
