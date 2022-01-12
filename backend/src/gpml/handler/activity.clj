(ns gpml.handler.activity
  (:require [clojure.string :as str]
            [gpml.db.activity :as db.activity]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def ^:const activity-types
  ["bookmark_resource" "create_resource"])

(def activity-types-error-msg-cfg
  {:error/message (str "should be: " (str/join "|" activity-types))})

(def ^:const activity-types-enum
  (apply vector :enum activity-types-error-msg-cfg activity-types))

(def activity-schema
  [:map
   [:id uuid?]
   [:type {:type "string"} activity-types-enum]
   [:created_at inst?]
   [:owner_id pos-int?]
   [:metadata {:optional true} [:maybe map?]]])

(def new-activity-schema
  [:map
   [:type {:type "string"} activity-types-enum]
   [:owner_id pos-int?]
   [:metadata {:optional true} [:maybe map?]]])

(defmethod ig/init-key :gpml.handler.activity/get-recent
  [_ {:keys [db]}]
  (fn [_]
    (let [result (db.activity/get-recent-activities (:spec db))]
      (resp/response result))))

(defmethod ig/init-key :gpml.handler.activity/get-response
  [_ _]
  [:vector activity-schema])
