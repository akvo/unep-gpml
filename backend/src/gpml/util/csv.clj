(ns gpml.util.csv
  (:require [clojure.data.csv :as csv]
            [clojure.java.io :as io]
            [clojure.set :as set])
  (:import [java.util UUID]))

(defn uuid
  ([] (UUID/randomUUID))
  ([str-uuid] (UUID/fromString str-uuid)))

(defn create-tmp-file
  ([]
   (io/file (str (System/getProperty "java.io.tmpdir") "/" (uuid))))
  ([ext]
   (io/file (str (System/getProperty "java.io.tmpdir") "/" (uuid) ext))))

(defn write-to-csv-file
  "Write CSV data to a file. Uses the `x-UTF-16LE-BOM` encoding as it is
  the most widely supported encoding for Excel."
  [file csv-data]
  (try
    (with-open [writer (io/writer file :encoding "x-UTF-16LE-BOM")]
      (csv/write-csv writer csv-data))
    (catch Exception _ nil)))

(defn coll->csv
  "Converts a collection of maps into a collections of vector suitable
  for saving in CSV format."
  [coll]
  (let [all-keys (apply set/union (map (comp set keys) coll))
        sorted-keys (sort (vec all-keys))
        values-fn (fn [m] (mapv m sorted-keys))
        value-rows (map values-fn coll)]
    (vec (cons sorted-keys value-rows))))

(defn preserve-sort-coll->csv
  "Converts a collection of maps into a collections of vector suitable
  for saving in CSV format while preserving the sort order"
  [coll]
  (let [all-keys (keys (first coll))
        values-fn (fn [m] (mapv m all-keys))
        value-rows (map values-fn coll)]
    (vec (cons all-keys value-rows))))
