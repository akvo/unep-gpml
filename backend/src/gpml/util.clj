(ns gpml.util
  (:import [java.util UUID]))

(defn uuid
  "If no argument is passed, creates a random UUID. If the passed
  paramenter is a UUID, returns it verbatim. If it is a string
  representing a UUID value return the corresponding UUID. Any other
  value or invalid string returns nil. "
  ([]
   (UUID/randomUUID))
  ([uuid]
   (try
     (cond
       (uuid? uuid)
       uuid

       (string? uuid)
       (UUID/fromString uuid))
     (catch Exception _
       nil))))

(defn update-if-exists [map key update-fn & args]
  (if (get map key)
    (apply update map key update-fn args)
    map))
