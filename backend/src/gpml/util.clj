(ns gpml.util
  (:require
   [clojure.string :as str]
   [clojure.walk :as w])
  (:import
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

(defn update-if-exists
  "Updates a map `m` key `k` if the value of `k` is not falsy. Otherwise
  returns the `m` unchanged."
  [m k update-fn & args]
  (if (get m k)
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
