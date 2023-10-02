(ns gpml.service.chat-curated-channel
  (:require [gpml.db.chat-curated-channel :as db.cc-channel]))

(defn create-chat-curated-channel
  [{:keys [db]} chat-curated-channel-id]
  (db.cc-channel/create-chat-curated-channel (:spec db)
                                             {:id chat-curated-channel-id}))

(defn delete-chat-curated-channel
  [{:keys [db]} chat-curated-channel-id]
  (db.cc-channel/delete-chat-curated-channel (:spec db)
                                             chat-curated-channel-id))

(defn get-chat-curated-channels
  [{:keys [db]} search-opts]
  (db.cc-channel/get-chat-curated-channels (:spec db)
                                           search-opts))
