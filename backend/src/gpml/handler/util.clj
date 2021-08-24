(ns gpml.handler.util)

(defn page-count [count limit]
  (int (Math/ceil (float (/ count (or (and (> limit 0) limit) 1))))))
