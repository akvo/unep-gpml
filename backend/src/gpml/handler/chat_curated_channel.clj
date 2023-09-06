(ns gpml.handler.chat-curated-channel
  (:require [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.service.chat-curated-channel :as srv.cc-channel]
            [integrant.core :as ig]))

(defn- get-chat-curated-channels
  [config _req]
  (let [result (srv.cc-channel/get-chat-curated-channels config
                                                         {})]
    (if (:success? result)
      (r/ok {:success? true
             :chat_curated_channels (:chat-curated-channels result)})
      (r/server-error result))))

(defn- create-chat-curated-channel
  [config {:keys [user] :as req}]
  (if-not (h.r.permission/super-admin? config (:id user))
    (r/forbidden {:message "Unauthorized"})
    (let [chat-curated-channel-id (get-in req [:parameters :body :id])
          result (srv.cc-channel/create-chat-curated-channel config
                                                             chat-curated-channel-id)]
      (if (:success? result)
        (r/ok result)
        (r/server-error result)))))

(defn- delete-chat-curated-channel
  [config {:keys [user] :as req}]
  (if-not (h.r.permission/super-admin? config (:id user))
    (r/forbidden {:message "Unauthorized"})
    (let [chat-curated-channel-id (get-in req [:parameters :path :id])
          result (srv.cc-channel/delete-chat-curated-channel config
                                                             chat-curated-channel-id)]
      (if (:success? result)
        (r/ok result)
        (r/server-error result)))))

(defmethod ig/init-key :gpml.handler.chat-curated-channel/get
  [_ config]
  (fn [req]
    (get-chat-curated-channels config req)))

(defmethod ig/init-key :gpml.handler.chat-curated-channel/post
  [_ config]
  (fn [req]
    (create-chat-curated-channel config req)))

(defmethod ig/init-key :gpml.handler.chat-curated-channel/delete
  [_ config]
  (fn [req]
    (delete-chat-curated-channel config req)))

(defmethod ig/init-key :gpml.handler.chat-curated-channel/post-params
  [_ _]
  {:body [:map [:id [:string {:min 1}]]]})

(defmethod ig/init-key :gpml.handler.chat-curated-channel/delete-params
  [_ _]
  {:path [:map [:id [:string {:min 1}]]]})
