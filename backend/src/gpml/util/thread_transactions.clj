(ns gpml.util.thread-transactions
  (:require
   [duct.logger :refer [log]]
   [gpml.util.malli :refer [check!]]
   [taoensso.timbre :as timbre]))

(def ^:private transaction-schema
  [:map
   [:txn-fn fn?]
   [:rollback-fn {:optional true} fn?]])

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
                                :message (.getMessage e)}}))))

;; TODO - wrap in `with-transaction`? (drawback: some "transactions" can be unrelated to DB e.g. http calls from what I've seen)
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
    (let [{:keys [txn-fn rollback-fn]} (first txns)
          result (safe-run logger txn-fn args-map)]
      (if-not (:success? result)
        result
        (let [next-result (thread-transactions logger (rest txns) result)]
          (if (:success? next-result)
            next-result
            (if-not rollback-fn
              next-result
              (safe-run logger rollback-fn next-result))))))))
