(ns gpml.boundary.port.chat)

(defprotocol Chat
  (create-user-account [this user])
  (get-public-channels [this opts])
  (get-private-channels [this opts])
  (set-user-account-active-status
    [this user-id active?]
    [this user-id active? opts])
  (get-user-info
    [this user-id]
    [this user-id opts]))
