(ns gpml.util.json
  (:require [jsonista.core :as json]))

(defn ->json
  ([coll]
   (->json coll {}))
  ([coll {:keys [encode-key-fn]
          :or {encode-key-fn name}}]
   (let [mapper (json/object-mapper {:encode-key-fn encode-key-fn})]
     (json/write-value-as-string coll mapper))))

(defn <-json
  ([str]
   (<-json str {}))
  ([str {:keys [decode-key-fn]
         :or {decode-key-fn keyword}}]
   (let [mapper (json/object-mapper {:decode-key-fn decode-key-fn})]
     (json/read-value str mapper))))
