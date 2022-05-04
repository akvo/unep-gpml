(ns gpml.handler.resource.tag
  "Generic namespace for resource tags related functionality. That means
  the functionality every platform resource (Policy, Event,
  Technology, Financing, Technical, Action, Organization and
  Stakeholder) shares in common."
  (:require
   [gpml.db.resource.tag :as db.resource.tag]
   [gpml.email-util :as email]
   [gpml.handler.tag :as handler.tag]))

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

(defn create-resource-tags
  "Creates the relation between a resource `resource-name` and tags. If
  some of the tags don't exists they are created."
  [conn mailjet-config {:keys [tags tag-category resource-name resource-id]}]
  (let [tags-ids (map :id tags)
        table (str resource-name "_tag")]
    (if-not (some nil? tags-ids)
      (db.resource.tag/create-resource-tags conn
                                            {:table table
                                             :resource-col resource-name
                                             :tags (map (partial vector resource-id) tags-ids)})
      (let [new-tags-ids (handler.tag/create-tags conn tags tag-category)
            tags-to-add (map (partial vector resource-id) (concat (remove nil? tags-ids) new-tags-ids))
            new-tags (db.resource.tag/create-resource-tags conn {:table table
                                                                 :resource-col resource-name
                                                                 :tags tags-to-add})]
        (send-new-tags-admins-pending-approval-notification conn mailjet-config new-tags)))))

(defn update-resource-tags
  "Updates existing relations between a resource `resource-name` and tags."
  [conn mailjet-config {:keys [resource-name resource-id] :as opts}]
  (db.resource.tag/delete-resource-tags conn {:table (str resource-name "_tag")
                                              :resource-col resource-name
                                              :resource-id resource-id})
  (create-resource-tags conn mailjet-config opts))
