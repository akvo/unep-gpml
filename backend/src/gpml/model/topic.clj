(ns gpml.model.topic
  (:require [gpml.constants :as constants]))

(defn public? [topic] (not (contains? constants/approved-user-topics topic)))
