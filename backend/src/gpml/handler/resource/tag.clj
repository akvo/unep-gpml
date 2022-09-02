(ns gpml.handler.resource.tag
  "Generic namespace for resource tags related functionality. That means
  the functionality every platform resource (Policy, Event,
  Technology, Financing, Technical, Action, Organization and
  Stakeholder) shares in common."
  (:require [duct.logger :refer [log]]
            [gpml.db.resource.tag :as db.resource.tag]
            [gpml.handler.tag :as handler.tag]
            [gpml.util.email :as email]
            [gpml.util.postgresql :as pg-util])
  (:import [java.sql SQLException]))

(defn send-new-tags-admins-pending-approval-notification
  "Send notifications about new created tags that needs approval.
  TODO: We probably should create a notification that accepts multiple
  items instead of mapping through them."
  [conn mailjet-config new-tags]
  (pmap
   (fn [tag]
     (email/notify-admins-pending-approval conn
                                           mailjet-config
                                           (merge tag {:type "tag"})))
   new-tags))

(defn- prep-resource-tags
  [resource-name resource-id tags-ids tag-category]
  (if (= resource-name "stakeholder")
    (map #(vector resource-id % tag-category) tags-ids)
    (map (partial vector resource-id) tags-ids)))

;; TODO: We are throwing again the captured exception so it is catched by above handlers, but we should return result
;; and handle it in another way. Done this to log this specific error but keep current functionality without too much
;; refactor, for now.
;; We are using `handle-errors?` flag to avoid raising the exception for some cases where we actually handle this error.
(defn create-resource-tags
  "Creates the relation between a resource `resource-name` and tags. If
  some of the tags don't exists they are created."
  [conn logger mailjet-config {:keys [tags tag-category resource-name resource-id handle-errors?]}]
  (let [tags-ids (map :id tags)
        table (str resource-name "_tag")]
    (if-not (some nil? tags-ids)
      (do
        (db.resource.tag/create-resource-tags conn
                                              {:table table
                                               :resource-col resource-name
                                               :tags (prep-resource-tags resource-name resource-id tags-ids tag-category)})
        {:success? true})
      (try
        (let [new-tags-ids (handler.tag/create-tags conn tags tag-category)
              tags-to-add (concat (remove nil? tags-ids) new-tags-ids)
              resource-tags-to-add (prep-resource-tags resource-name resource-id tags-to-add tag-category)
              new-tags (db.resource.tag/create-resource-tags conn {:table table
                                                                   :resource-col resource-name
                                                                   :tags resource-tags-to-add})]
          (send-new-tags-admins-pending-approval-notification conn mailjet-config new-tags)
          {:success? true})
        (catch Exception e
          (log logger :error ::failed-to-create-tag {:exception-message (.getMessage e)})
          (if (instance? SQLException e)
            (let [reason (pg-util/get-sql-state e)]
              (when-not handle-errors?
                (throw e))
              {:success? false
               :reason (if (= :unique-constraint-violation reason)
                         :duplicate-tag-attempt
                         reason)
               :error-details {:message (.getMessage e)}})
            {:success? false
             :reason :could-not-create-new-tags
             :error-details {:message (.getMessage e)}}))))))

(defn update-resource-tags
  "Updates existing relations between a resource `resource-name` and tags."
  [conn logger mailjet-config {:keys [resource-name resource-id] :as opts}]
  (db.resource.tag/delete-resource-tags conn {:table (str resource-name "_tag")
                                              :resource-col resource-name
                                              :resource-id resource-id})
  (create-resource-tags conn logger mailjet-config opts))
