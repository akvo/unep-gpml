(ns gpml.handler.activity
  (:require [clojure.string :as str]
            [gpml.db.activity :as db.activity]
            [integrant.core :as ig]
            [ring.util.response :as resp])
  (:import [java.util UUID]))

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

(defn create-activity
  [db activity]
  (let [activity (assoc activity :id (UUID/randomUUID))]
    (db.activity/create-activity (:spec db) activity)))

(defmethod ig/init-key :gpml.handler.activity/post
  [_ {:keys [db]}]
  (fn [{:keys [body-params headers]}]
    (let [result (create-activity db body-params)]
      (if (= result 1)
        (resp/created (:referer headers) {:message "Activity created."})
        (resp/status {:error "Could not create activity"} 500)))))

(defmethod ig/init-key :gpml.handler.activity/post-params
  [_ _]
  new-activity-schema)

(defmethod ig/init-key :gpml.handler.activity/post-response
  [_ _]
  [:map
   [:message string?]])

(defmethod ig/init-key :gpml.handler.activity/get
  [_ {:keys [db]}]
  (fn [_]
    (let [result (db.activity/get-recent-activities (:spec db))]
      (resp/response result))))

(defmethod ig/init-key :gpml.handler.activity/get-response
  [_ _]
  [:vector activity-schema])
