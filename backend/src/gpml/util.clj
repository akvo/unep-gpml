(ns gpml.util
  (:require [clojure.string :as str]
            [clojure.walk :as w]
            [gpml.util.regular-expressions])
  (:import [java.io File]
           [java.net URL URLEncoder]
           [java.util Base64]
           [java.util UUID]))

(defn uuid
  "If no argument is passed, creates a random UUID. If the passed
  paramenter is a UUID, returns it verbatim. If it is a string
  representing a UUID value return the corresponding UUID. Any other
  value or invalid string returns nil. "
  ([]
   (UUID/randomUUID))
  ([uuid]
   (try
     (cond
       (uuid? uuid)
       uuid

       (string? uuid)
       (UUID/fromString uuid))
     (catch Exception _
       nil))))

(defn try-url-str
  "Tries creating a java.net.URL from the provided string `s`. If it
  fails returns false."
  [s]
  (try
    (URL. s)
    (catch Exception  _
      false)))

(defn update-if-exists
  "Updates a map `m` key `k` if it exists. Otherwise returns `m`
  unchaged."
  [m k update-fn & args]
  (if-not (= ::not-found (get m k ::not-found))
    (apply update m k update-fn args)
    m))

(defn update-if-not-nil
  "Updates a map `m` key `k` if the value of `k` is not nil. Otherwise
  returns the `m` unchanged."
  [m k update-fn & args]
  (if-not (nil? (get m k))
    (apply update m k update-fn args)
    m))

(defn non-blank-string?
  "Predicate to check whether the string `s` is a `java.lang.String` and
  if it's not a blank string."
  [s]
  (and (string? s)
       (not (str/blank? s))))

(defn str-number?
  "Predicate to check whether the string `s` is a number."
  [s]
  (and (string? s)
       (re-matches #"[0-9]+" s)))

(defn replace-in-keys
  "Replace a map `m` keys considering the `match` and `replacement`."
  [m match replacement]
  (let [f (fn [[k v]]
            (cond
              (keyword? k)
              [(keyword (str/replace (name k) match replacement)) v]

              (string? k)
              [(keyword (str/replace k match replacement)) v]

              :else
              [k v]))]
    ;; only apply to maps
    (w/postwalk (fn [x] (if (map? x) (into {} (map f x)) x)) m)))

(defn build-hierarchy
  "Given a `flat-list` of vector of maps at a given level
  `current-root`, builds an hierachy based on the `parent-id-k` value of each
  map."
  ([flat-list current-root]
   (build-hierarchy flat-list current-root :parent-id))
  ([flat-list current-root parent-id-k]
   {:pre [(keyword? parent-id-k)]}
   (let [{:keys [direct-children others]}
         (reduce-kv (fn [m _k v]
                      (if (= (parent-id-k v) (:id current-root))
                        (update m :direct-children conj v)
                        (update m :others conj v)))
                    (sorted-map)
                    (vec flat-list))]
     (if (seq direct-children)
       (let [children (map (fn [direct-child]
                             (build-hierarchy others direct-child parent-id-k))
                           direct-children)]
         (assoc current-root :children children))
       current-root))))

(defn create-tmp-file
  "Creates a temporary file. If no `prefix` and `suffix` is given it
  will create the file with the default values."
  ([]
   (create-tmp-file "gpml_tmp_file_" ""))
  ([prefix suffix]
   (try
     (File/createTempFile prefix suffix)
     (catch Exception _ nil))))

(defn encode-base64
  "Encodes a byte[] as String using Base64"
  [src]
  (.encodeToString (Base64/getEncoder) src))

(defn decode-base64
  "Returns a byte[] from a Base64 encoded String"
  [src]
  (.decode (Base64/getDecoder) src))

(defn base64?
  "Check that `src` is a valid Base64 encoded String"
  [src]
  (or (= src "")
      (and (re-matches #"[0-9a-zA-Z+/]+={0,2}" src)
           (= 0 (rem (count src) 4)))))

(defn base64-headless
  "Returns the base64 encoded string without the header."
  [src]
  (last (re-find #"^data:(\S+);base64,(.*)$" src)))

(defn add-base64-header
  "Adds the base64 header given the `mime-type` and `base64-str`."
  [mime-type base64-str]
  (format "data:%s;base64,%s" mime-type base64-str))

(defn select-values
  "Same as select-keys but for values and respecting the order of `ks`.
   `nil` values are removed from the final output."
  [m ks]
  (remove nil? (map #(get m %) ks)))

(defn apply-select-values
  "Applies the `select-values` function to a collection of maps `coll`."
  [coll ks]
  (map #(select-values % ks) coll))

(defn dissoc-nil-or-empty-val-keys
  "Dissoc keys from map `m` which have `nil` or empty strings values."
  [m]
  (apply
   dissoc
   m
   (for [[k v] m
         :when (or (and (string? v)
                        (not (seq v)))
                   (nil? v))]
     k)))

(defn xor?
  "Returns the xor of all its arguments. The elements are considered
  logical false as per [[clojure.core/if]] logic.

  Code borrowed from: https://clojurians-log.clojureverse.org/clojure/2020-07-04"
  [& xs]
  (loop [acc false
         xs xs]
    (if-let [xs (seq xs)]
      (let [x (first xs)
            acc (if x
                  (if acc false x)
                  acc)]
        (recur acc (next xs)))
      acc)))

(defn email?
  "Check if the provided argument is a valid email"
  [email]
  (and string?
       (re-matches gpml.util.regular-expressions/email-re email)))

(defn encode-url-param
  [^String param]
  (URLEncoder/encode param "utf-8"))
