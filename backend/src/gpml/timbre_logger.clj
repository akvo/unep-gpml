(ns gpml.timbre-logger
  (:require
   [duct.logger.timbre]
   [integrant.core :as ig]
   [taoensso.timbre :as timbre]))

(defn- duct-log-format?
  "Removes the `(namespace evt)` criterion,
  allowing us to use unqualified keywords as events."
  [vargs]
  (and (<= 1 (count vargs) 2)
       (let [[evt data] vargs]
         (and (keyword? evt)
              (or (nil? data)
                  (map? data))))))

(defn wrap-legacy-logs [{:keys [vargs] :as data}]
  (cond-> data
    (not (duct-log-format? vargs))
    (assoc :vargs [:duct.logger.timbre/legacy vargs])))

;; Override the original :duct.logger/timbre so that it can keeps appender already present `in timbre/*config*`.
;; Note that one can't trivially replace the original :duct.logger/timbre component.
;; (Will PR)
(defmethod ig/init-key :duct.logger/timbre [_ config]
  (let [timbre-logger (duct.logger.timbre/->TimbreLogger config)
        prev-root timbre/*config*]
    (cond
      (:merge-root-config? config) ;; new custom option
      (do
        (timbre/merge-config! (assoc config :middleware (->> timbre/*config*
                                                             :middleware
                                                             (remove #{duct.logger.timbre/wrap-legacy-logs
                                                                       wrap-legacy-logs})
                                                             (into [wrap-legacy-logs]))))
        (-> timbre/*config* ;; also log to the cider appender
            duct.logger.timbre/->TimbreLogger
            (assoc :prev-root-config prev-root)))

      (:set-root-config? config) ;; traditional option - also modified to use our tweaked middleware
      (let [config (update config :middleware (fnil conj []) wrap-legacy-logs)]
        (timbre/set-config! config)
        (assoc timbre-logger :prev-root-config prev-root))

      :else
      timbre-logger)))
