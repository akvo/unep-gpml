(ns gpml.util.crypto
  (:require
   [gpml.util.malli :refer [check!]])
  (:import
   (java.security SecureRandom)
   (org.apache.commons.codec.binary Hex)))

(defn create-crypto-random-byte-array
  [size]
  (let [random (SecureRandom.)
        bt-array (byte-array size)]
    (.nextBytes random bt-array)
    bt-array))

(defn create-crypto-random-hex-string
  [size]
  {:pre [(check! pos-int? size
                 zero?    (rem size 2))]}
  (->> ^bytes (create-crypto-random-byte-array (/ size 2))
       (Hex/encodeHexString)))
