(ns gpml.domain.geo-coverage
  (:require [gpml.util :as util]
            [malli.core :as m]))

(def GeoCoverage
  "Geo Coverage schema. This is a sub entity relation stored in the
  `<entity-name>_geo_coverage` tables."
  (m/schema
   [:and
    [:map
     [:resource {:optional true} pos-int?]
     [:event {:optional true} pos-int?]
     [:policy {:optional true} pos-int?]
     [:technology {:optional true} pos-int?]
     [:initiative {:optional true} pos-int?]
     [:organisation {:optional true} pos-int?]
     [:country {:optional true} pos-int?]
     [:country_group {:optional true} pos-int?]]
    [:fn (fn [{:keys [resource event policy technology organisation country country_group]}]
           (and (util/xor? country country_group)
                (util/xor? resource event policy technology organisation)))]]))
