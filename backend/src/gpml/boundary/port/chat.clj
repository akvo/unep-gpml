(ns gpml.boundary.port.chat)

(defprotocol Chat
  :extend-via-metadata true
  (create-user-account [this user])

  (update-user-account [this user-id updates])

  (delete-user-account [this user-id opts])

  (get-public-channels [this opts])

  (get-private-channels [this opts])

  (get-all-channels [this opts])

  (set-user-account-active-status [this user-id active? opts])

  (get-user-info [this user-id opts])

  (get-user-joined-channels [this user-id])

  (remove-user-from-channel [this user-id channel-id channel-type])

  (add-user-to-private-channel [this user-id channel-id])

  (add-user-to-public-channel [this user-id channel-id])

  (create-private-channel [this channel])

  (set-private-channel-custom-fields [this channel-id custom-fields])

  (delete-private-channel [this channel-id])

  (create-public-channel [this channel])

  (set-public-channel-custom-fields [this channel-id custom-fields])

  (delete-public-channel [this channel-id])

  (get-channel-discussions [this channel-id]))
