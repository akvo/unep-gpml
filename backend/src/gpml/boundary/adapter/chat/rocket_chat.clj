(ns gpml.boundary.adapter.chat.rocket-chat
  (:require [gpml.boundary.adapter.chat.rocket-chat.core :as rocket-chat]
            [integrant.core :as ig]))

(defmethod ig/init-key :gpml.boundary.adapter.chat/rocket-chat
  [_ config]
  (rocket-chat/map->RocketChat config))
