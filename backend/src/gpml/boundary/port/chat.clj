(ns gpml.boundary.port.chat
  (:require
   [clojure.walk :as walk]
   [gpml.util.malli :as util.malli :refer [failure-with success-with]]
   [malli.util :as mu]))

(def Channel ;; TODO https://clojurians.slack.com/archives/CLDK6MFMK/p1709154587503499
  [:map
   [:show-notification-for-all-channels boolean?]
   [:name string?]
   [:enable-like-message boolean?]
   [:id string?]
   [:enable-one-to-one-chat boolean?]
   [:password-protected boolean?]
   [:default-notification-enabled boolean?]
   [:moderator-only-one-to-one-chat boolean?]
   [:enable-channels boolean?]])

;; XXX consolidate with UserInfo
(def Member
  [:map
   [:role-name :string]
   #_[:id :string]
   [:created :string]
   #_[:customer :string]
   #_[:v :int]
   [:user
    [:map
     [:email :string]
     #_[:parent-customer-account :string]
     #_[:v :int]
     [:updated :string]
     [:provisioned :boolean]
     [:username :string]
     [:created :string]
     [:created-using-api :boolean]
     [:external-user-id :string]
     [:id :string]
     [:is-moderator :boolean]
     [:unique-user-identifier :string]]]])

(def Members
  [:map
   [:limit :int]
   [:total :int]
   [:skip :int]
   [:data [:vector Member]]])

(def Messages
  [:map
   [:limit :int]
   [:total-records :int]
   [:messages [:vector :any]]
   [:count :int]
   [:skip :int]])

(def ExtendedChannel
  (-> Channel
      (mu/assoc :members Members)
      (mu/assoc :messages Messages)))

(def Channels
  [:sequential Channel])

(util.malli/defprotocol Chat
  :extend-via-metadata true
  (add-user-to-private-channel [this user-id channel-id])

  (add-user-to-public-channel [this user-id channel-id])

  (create-private-channel [this channel])

  (create-public-channel [this channel])

  (create-user-account [this user])

  (delete-private-channel [this channel-id])

  (delete-public-channel [this channel-id])

  (delete-user-account [this user-id opts])

  (^{:schema [:or
              (success-with :channels Channels)
              (failure-with :error-details any?)]}
    get-all-channels [this opts])

  (^{:schema [:or
              (success-with :channel ExtendedChannel)
              (failure-with :error-details any?)]}
    get-channel [this channel-id])

  (get-channel-discussions [this channel-id])

  (get-private-channels [this opts])

  (get-public-channels [this opts])

  (get-user-info [this user-id opts])

  (get-user-joined-channels [this user-id])

  (remove-user-from-channel [this user-id channel-id channel-type])

  (set-private-channel-custom-fields [this channel-id custom-fields])

  (set-public-channel-custom-fields [this channel-id custom-fields])

  (set-user-account-active-status [this user-id active? opts] "Activates/deactivates a user account, according to the `active?` parameter.")

  (update-user-account [this user-id updates]))
