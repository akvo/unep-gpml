(ns gpml.util.result
  (:require
   [clojure.set :as set]))

(defmacro failure
  "Creates an object representing failure,
  with extra file/line/column entries,
  so that it can be easily diagnosed in logs/Sentry."
  {:style/indent :form}
  [m & kvs]
  (list `merge
        m
        (into {:success? false}
              (mapv vec (partition 2 kvs)))
        (some-> &form
                meta
                (select-keys [:file :line :column])
                (set/rename-keys {:file   ::file
                                  :line   ::line
                                  :column ::column}))))
