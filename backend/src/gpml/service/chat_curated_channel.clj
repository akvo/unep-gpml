(ns gpml.service.chat-curated-channel
  (:require
   [gpml.db.chat-curated-channel :as db.cc-channel]))

(defn create-chat-curated-channel [{:keys [db]} chat-curated-channel-id]
  (db.cc-channel/create-chat-curated-channel (:spec db)
                                             {:id chat-curated-channel-id}))

(defn delete-chat-curated-channel [{:keys [db logger]} chat-curated-channel-id]
  {:pre [logger]}
  (db.cc-channel/delete-chat-curated-channel logger
                                             (:spec db)
                                             chat-curated-channel-id))

(defn get-chat-curated-channels [{:keys [db logger]} search-opts]
  {:pre [logger]}
  (db.cc-channel/get-chat-curated-channels logger
                                           (:spec db)
                                           search-opts))
