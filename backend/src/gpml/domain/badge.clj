(ns gpml.domain.badge
  (:require [gpml.domain.miscellaneous :as dom.misc]
            [gpml.domain.types :as dom.types]
            [malli.core :as m]))

(def Badge
  "The Badge entity model"
  (m/schema
   [:map
    [:id
     {:optional false
      :swagger
      {:description "The Badge's identifier"
       :type "integer"}}
     pos-int?]
    [:name
     {:optional false
      :swagger
      {:description "The Badge's name."
       :type "string"
       :allowEmptyValue false}}
     [:string {:min 1}]]
    [:type
     {:optional false
      :decode/string keyword
      :decode/json keyword
      :swagger
      {:description "The Badge's type."
       :type "string"
       :enum dom.types/badge-type
       :allowEmptyValue false}}
     (apply conj [:enum] dom.types/badge-type)]
    [:content_file
     {:optional false
      :swagger
      {:description "The Badge's content file. Base64 encoded string."
       :type "string"
       :format "byte"}}
     [:and
      [:string {:min 1}]
      dom.misc/base64-schema]]]))
