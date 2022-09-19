(ns gpml.domain.geo-coverage
  (:require [malli.core :as m]))

(def GeoCoverage
  "FIXME"
  (m/schema
   [:and
    [:map
     [:resource {:optional true} pos-int?]
     [:event {:optional true} pos-int?]
     [:policy {:optional true} pos-int?]
     [:technology {:optional true} pos-int?]
     [:organisation {:optional true} pos-int?]
     [:country {:optional true} pos-int?]
     [:country_group {:optional true} pos-int?]]
    [:fn (fn [{:keys [_resource _event _policy _technology _organisation country country_group]}]
           ;; FIXME: add XOR check for resource fields
           (or (and country (not country_group))
               (and (not country) country_group)))]]))
