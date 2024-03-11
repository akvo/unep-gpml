(ns mocks.boundary.adapter.chat.ds-chat
  (:require
   [gpml.boundary.port.chat :as port]
   [gpml.util.malli :refer [success-with]]
   [integrant.core :as ig]
   [malli.generator :refer [generate]]))

(defn mock [schema]
  (fn [& _]
    (generate schema)))

(defn map->DSChat []
  (with-meta {}
    {`port/add-user-to-private-channel       (mock (success-with)) #_ds-chat/add-user-to-channel*
     `port/add-user-to-public-channel        (mock (success-with)) #_ds-chat/add-user-to-channel*
     `port/create-private-channel            (mock (success-with :channel port/CreatedChannel)) #_ds-chat/create-private-channel*
     `port/create-public-channel             (mock (success-with :channel port/CreatedChannel)) #_ds-chat/create-public-channel*
     `port/create-user-account               (mock (success-with :user port/CreatedUser)) #_ds-chat/create-user-account*
     ;; TODO -----------------
     `port/delete-private-channel            (mock (success-with)) #_ds-chat/delete-channel*
     `port/delete-public-channel             (mock (success-with)) #_ds-chat/delete-channel*
     `port/delete-user-account               (mock (success-with)) #_ds-chat/delete-user-account*
     `port/get-all-channels                  (mock (success-with)) #_ds-chat/get-all-channels*
     `port/get-private-channels              (mock (success-with)) #_ds-chat/get-all-channels*
     `port/get-public-channels               (mock (success-with)) #_ds-chat/get-all-channels*
     `port/get-channel-discussions           (mock (success-with)) #_ds-chat/get-channel-discussions*
     `port/get-user-info                     (mock (success-with)) #_ds-chat/get-user-info*
     `port/get-user-joined-channels          (mock (success-with)) #_ds-chat/get-user-joined-channels*
     `port/remove-user-from-channel          (mock (success-with)) #_ds-chat/remove-user-from-channel*
     `port/set-private-channel-custom-fields (mock (success-with)) #_ds-chat/set-channel-custom-fields*
     `port/set-public-channel-custom-fields  (mock (success-with)) #_ds-chat/set-channel-custom-fields*
     `port/set-user-account-active-status    (mock (success-with)) #_ds-chat/set-user-account-active-status*
     `port/update-user-account               (mock (success-with)) #_ds-chat/update-user-account*}))

(defmethod ig/init-key :mocks.boundary.adapter.chat/ds-chat
  [_ _]
  (map->DSChat))
