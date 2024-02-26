(ns gpml.util.json
  (:require
   [jsonista.core :as jsonista]))

(defn ->json
  ([coll]
   (->json coll {}))

  ([coll {:keys [encode-key-fn]
          :or {encode-key-fn name}}]
   (let [mapper (jsonista/object-mapper {:encode-key-fn encode-key-fn})]
     (jsonista/write-value-as-string coll mapper))))

(defn <-json
  ([str]
   (<-json str {}))

  ([str {:keys [decode-key-fn]
         :or {decode-key-fn keyword}}]
   (let [mapper (jsonista/object-mapper {:decode-key-fn decode-key-fn})]
     (jsonista/read-value str mapper))))
