(ns gpml.util.thread-transactions
  "Implements the Saga pattern
  (but locally - not in the distributed systems sense).

  This can be a good idea for mixing DB persistence with side-effectful IO."
  (:require
   [duct.logger :refer [log]]
   [gpml.util.malli :refer [check!]]
   [taoensso.timbre :as timbre]))

(def ^:private transaction-schema
  [:maybe ;; individual tx fns can be nil, allowing conditionally executed fns
   [:or
    [:fn fn?]
    [:map {:closed true}
     [:txn-fn fn?]
     [:rollback-fn {:optional true} fn?]]]])

(def ^:private transactions-schema
  [:sequential {:min 0} transaction-schema])

(def ^:private args-map-schema
  [:map])

(defn- safe-run [logger f m]
  (try
    (f m)
    (catch Exception e
      (timbre/with-context+ {::context m}
        (log logger :error :thread-transactions-exception e))
      (merge m {:success? false
                :error-details {:reason (str (class e))
                                :message (.getMessage e)}}))
    (catch AssertionError e
      (timbre/with-context+ {::context m}
        (log logger :error :thread-transactions-exception e))
      (merge m {:success? false
                :error-details {:reason (str (class e))
                                :message (.getMessage e)}}))))

(defn thread-transactions [logger txns args-map]
  {:pre [(check! transactions-schema txns
                 args-map-schema     args-map)]}
  (if-not (seq txns)
    ;; If there are no more transactions to process, then the passed
    ;; in `args-map` is the return value of the last transaction. If we
    ;; reached here is because the last transaction was successful. So
    ;; simply return `args-map` as the final value of the whole
    ;; transactions application.
    args-map
    (let [txns (into [] (remove nil?) txns) ;; individual tx fns can be nil, allowing conditionally executed fns
          head (first txns)
          {:keys [txn-fn rollback-fn]} (if (map? head)
                                         head
                                         ;; Support shorthand syntax:
                                         {:txn-fn head})
          result (safe-run logger txn-fn args-map)]
      (assert (contains? result :success?))
      (if-not (:success? result)
        result
        (let [next-result (thread-transactions logger (rest txns) result)]
          (if (:success? next-result)
            next-result
            (if-not rollback-fn
              next-result
              (safe-run logger rollback-fn next-result))))))))

(defmacro saga
  {:style/indent 2}
  [logger args-map & txns]
  {:pre [(seq txns)]}
  (list `thread-transactions logger (vec txns) args-map))
