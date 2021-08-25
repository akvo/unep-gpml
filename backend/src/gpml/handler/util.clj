(ns gpml.handler.util)

(defn page-count [count limit]
  (let [limit* (or
                (and (> limit 0) limit)
                1)]
    (int (Math/ceil (float (/ count limit*))))))
