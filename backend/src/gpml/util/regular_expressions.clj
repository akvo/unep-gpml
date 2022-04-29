(ns gpml.util.regular-expressions
  (:require [clojure.string :as str]))

(def ^:const uuid-regex #"^[0-9a-zA-Z]{8}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{12}$")
(def ^:const date-iso-8601-re #"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$")
(def ^:const comma-separated-numbers-re #"^\d+(,\d+)*$")

(defn comma-separated-enums-re
  [enum-coll]
  (re-pattern (format "^(%1$s)((,(%1$s))+)?$" (str/join "|" enum-coll))))
