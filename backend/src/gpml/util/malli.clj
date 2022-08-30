(ns gpml.util.malli
  (:refer-clojure :exclude [dissoc])
  (:require [malli.util :as mu]))

(defn dissoc
  "Like [[malli.util/dissoc]] but accepts a sequence of keys `ks` to be
  dissociated from the schema."
  ([?schema ks]
   (dissoc ?schema ks nil))
  ([?schema ks options]
   (mu/transform-entries ?schema #(remove (fn [[k]] (get (set ks) k)) %) options)))
