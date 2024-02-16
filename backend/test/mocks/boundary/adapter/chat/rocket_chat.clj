(ns mocks.boundary.adapter.chat.rocket-chat
  (:require
   [gpml.boundary.port.chat :as port]
   [gpml.util :as util]
   [integrant.core :as ig]))

(defn- create-user-account
  []
  {:success? true
   :user {:id (str (util/uuid))
          :active true}})

(defrecord MockRocketChat []
  port/Chat
  (create-user-account [_ _]
    (create-user-account)))

(defmethod ig/init-key :mocks.boundary.adapter.chat/rocket-chat
  [_ _]
  (->MockRocketChat))
