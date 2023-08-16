(ns gpml.handler.file
  (:require [gpml.db.stakeholder :as db.stakeholder]
            [gpml.domain.file :as dom.file]
            [gpml.service.file :as srv.file]
            [integrant.core :as ig]
            [ring.util.response :as resp])
  (:import java.io.ByteArrayInputStream
           java.util.Base64))

(defn create-file
  [config conn file-payload entity-key file-key visibility-key]
  (let [file (dom.file/base64->file file-payload entity-key file-key visibility-key)
        result (srv.file/create-file config conn file)]
    (if (:success? result)
      (get-in result [:file :id])
      (throw (ex-info "Failed to create file" {})))))

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
