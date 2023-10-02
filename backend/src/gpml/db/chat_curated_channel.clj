(ns gpml.db.chat-curated-channel
  {:ns-tracker/resource-deps ["chat_curated_channel.sql"]}
  (:require [gpml.db.jdbc-util :as jdbc-util]
            [hugsql.core :as hugsql]))

(declare get-chat-curated-channels*
         create-chat-curated-channel*
         delete-chat-curated-channel*)

(hugsql/def-db-fns "gpml/db/chat_curated_channel.sql")

(defn get-chat-curated-channels
  [conn opts]
  (try
    {:success? true
     :chat-curated-channels (get-chat-curated-channels* conn opts)}
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn create-chat-curated-channel
  [conn chat-curated-channel]
  (jdbc-util/with-constraint-violation-check
    [{:type :unique
      :name "chat_curated_channel_pkey"
      :error-reason :already-exists}]
    (create-chat-curated-channel* conn chat-curated-channel)
    {:success? true}))

(defn delete-chat-curated-channel
  [conn chat-curated-channel-id]
  (try
    (let [affected (delete-chat-curated-channel* conn {:id chat-curated-channel-id})]
      (if (= affected 1)
        {:success? true}
        {:success? false
         :reason :failed-to-delete-curated-channel
         :error-details {:expected-affected-rows 1
                         :actual-affected-rows affected}}))
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))
