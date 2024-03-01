(ns gpml.util.malli
  (:refer-clojure :exclude [defprotocol dissoc keys])
  (:require
   [clojure.walk :as walk]
   [malli.core :as m]
   [malli.error]
   [malli.util :as mu]))

(defn check-one [sch val quoted]
  (let [schema (if (and (instance? clojure.lang.IMeta sch)
                        (-> sch meta :schema))
                 (-> sch meta :schema eval)
                 sch)]
    (if (m/validate schema val)
      true
      (let [x (m/explain schema val)]
        (throw (ex-info "Schema validation failed"
                        (cond-> x
                          (not= quoted val) (assoc :quoted quoted)
                          true              (assoc :humanized (malli.error/humanize x)))))))))

(defn schema? [s]
  (try
    (malli.core/schema s)
    true
    (catch Exception _
      false)))

(defmacro check!
  "Accepts pairs of specs and vals.

  A spec can be a Malli spec, or a var with `:schema` metadata pointing to a Malli spec,
  as enabled by `gpml.util.malli/defprotocol`.

  Performs Malli validation over each pair,
  failing with an informative exception otherwise.

  Especially useful as `:pre`- / `:post`-conditions."
  [& spec-val-pairs]
  {:pre [(check-one [:fn seq] spec-val-pairs 'spec-val-pairs)
         (check-one [:fn even?] (count spec-val-pairs) 'spec-val-pairs)]}
  `(do
     ~@(mapv (fn [[spec val]]
               (list `let ['schema spec]
                     (when (check-one [:or
                                       [:fn schema?]
                                       [:fn (fn [x]
                                              (and (var? x)
                                                   (some-> x meta :schema eval schema?)))]]
                                      (eval spec)
                                      spec) ;; throw a compile-time exception on invalid schemas
                       (list `check-one 'schema val (list 'quote val)))))
             (partition 2 spec-val-pairs))))

(defn Result [success?]
  [:map
   [:success? {:json-schema/example success?
               :gen/return success?}
    [:and boolean? [:enum success?]]]])

(defn- result-with [success? & [[k v]]]
  {:pre [(check! boolean? success?)]}
  (m/schema (if k
              (mu/assoc (Result success?) k v)
              (Result success?))))

(defn success-with [& [k v]]
  (result-with true [k v]))

(defn failure-with [& [k v]]
  (result-with false [k v]))

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

(defmacro defprotocol
  "Exactly like `clojure.core/defprotocol`,
  but processes `:schema` metadata such that it can be safely `eval`ed.

  `:schema` metadata can be used by protocol implementations as a Malli schema
  to check their implementations against."
  [& args]
  (apply list
         'clojure.core/defprotocol
         (walk/postwalk (fn [x]
                          (cond-> x
                            (and (instance? clojure.lang.IMeta x)
                                 (-> x meta :schema))
                            (vary-meta update :schema (fn [x]
                                                        (walk/postwalk (fn [y]
                                                                         (if-not (symbol? y)
                                                                           y
                                                                           (or (and (qualified-symbol? y)
                                                                                    y)

                                                                               (some->> y (resolve &env) symbol)

                                                                               (and (simple-symbol? y)
                                                                                    (symbol (str *ns*)
                                                                                            (str y))))))
                                                                       x)))))
                        args)))
