(ns dev.tapping
  (:require clojure.pprint))

(def tap-pprint-fn (bound-fn* clojure.pprint/pprint))

(def data (atom []))

(def tap-atom-fn #(swap! data conj %))

(defn tap!
  ([] (tap! false true))
  ([pp? at?]
   (when pp?
     (remove-tap #'tap-pprint-fn)
     (add-tap #'tap-pprint-fn))
   (when at?
     (remove-tap #'tap-atom-fn)
     (add-tap #'tap-atom-fn))))

(defn untap!
  ([] (untap! false true))
  ([pp? at?]
   (when pp? (remove-tap #'tap-pprint-fn))
   (when at? (remove-tap #'tap-atom-fn))))

(defn reset-data! []
  (reset! data []))

(comment
  (tap!)
  (tap> {:example 1})
  (assert (= [{:example 1}] @data))
  (untap!)
  (tap> {:example 1})
  (assert (= [{:example 1}] @data))
  (tap!)
  (tap> {:example 2})
  (assert (= [{:example 1} {:example 2}] @data))
  (untap!)
  (reset-data!)
  (assert (= [] @data)))
