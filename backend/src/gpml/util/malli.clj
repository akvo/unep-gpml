(ns gpml.util.malli
  (:refer-clojure :exclude [dissoc keys])
  (:require [malli.core :as m]
            [malli.util :as mu]))

(defn dissoc
  "Like [[malli.util/dissoc]] but accepts a sequence of keys `ks` to be
  dissociated from the schema."
  ([?schema ks]
   (dissoc ?schema ks nil))
  ([?schema ks options]
   (mu/transform-entries ?schema #(remove (fn [[k]] (get (set ks) k)) %) options)))

(defn keys
  "Like [[clojure.core/keys]] but for EntrySchemas.

  NOTE: new versions of malli already include this function but we are
  using an older version because of reitit. Once reitit is updated
  with a more recent malli version that include this function, please
  remove it."
  [?schema]
  (when-let [entries (m/entries ?schema)]
    (for [[k _] entries]
      k)))
