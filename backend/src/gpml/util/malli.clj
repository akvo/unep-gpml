(ns gpml.util.malli
  (:refer-clojure :exclude [dissoc keys])
  (:require
   [malli.core :as m]
   [malli.error]
   [malli.util :as mu]))

(defn check-one [schema val quoted]
  (if (m/validate schema val)
    true
    (let [x (m/explain schema val)]
      (throw (ex-info "Schema validation failed"
                      (cond-> x
                        (not= quoted val) (assoc :quoted quoted)
                        true              (assoc :humanized (malli.error/humanize x))))))))

(defn schema? [s]
  (try
    (malli.core/schema s)
    true
    (catch Exception e
      false)))

(defmacro check!
  "Accepts pairs of specs and vals.

  Performs Malli validation over each pair,
  failing with an informative exception otherwise.

  Especially useful as `:pre`- / `:post`-conditions."
  [& spec-val-pairs]
  {:pre [(check-one [:fn seq] spec-val-pairs 'spec-val-pairs)
         (check-one [:fn even?] (count spec-val-pairs) 'spec-val-pairs)]}
  `(do
     ~@(mapv (fn [[spec val]]
               (list `let ['schema spec]
                     (when (check-one [:fn schema?] (eval spec) spec) ;; throw a compile-time exception on invalid schemas
                       (list `check-one 'schema val (list 'quote val)))))
             (partition 2 spec-val-pairs))))

(defn dissoc
  "Like `malli.util/dissoc` but accepts a sequence of keys `ks` to be
  dissociated from the schema."
  ([?schema ks]
   (dissoc ?schema ks nil))
  ([?schema ks options]
   (mu/transform-entries ?schema #(remove (fn [[k]] (get (set ks) k)) %) options)))

(defn keys
  "Like `clojure.core/keys` but for EntrySchemas.

  NOTE: new versions of malli already include this function but we are
  using an older version because of reitit. Once reitit is updated
  with a more recent malli version that include this function, please
  remove it."
  [?schema]
  (when-let [entries (m/entries ?schema)]
    (for [[k _] entries]
      k)))
