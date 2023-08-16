(ns gpml.domain.miscellaneous
  (:require [malli.core :as m]))

(def base64-schema
  (m/schema
   [:and
    [:string]
    [:or
     [:= ""]
     [:and
      [:re #"[0-9a-zA-Z+/]+={0,2}"]
      [:fn #(= 0 (rem (count %) 4))]]]]))
