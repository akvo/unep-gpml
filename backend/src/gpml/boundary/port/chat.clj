(ns gpml.boundary.port.chat
  (:require
   [camel-snake-kebab.core :refer [->snake_case]]
   [gpml.util.malli :as util.malli :refer [failure-with success-with]]
   [malli.util :as mu]))

(def private "private")

(def public "public")

(def ChannelPrivacy
  [:enum public private])

(def Channel ;; TODO https://clojurians.slack.com/archives/CLDK6MFMK/p1709154587503499
  [:map
   {}
   [:privacy {:optional true} ChannelPrivacy] ;; XXX not really optional - we're awaiting DSC feedback.
   [:metadata {:optional true} map?]
   [:show-notification-for-all-channels boolean?]
   [:name string?]
   [:enable-like-message boolean?]
   [:id string?]
   [:enable-one-to-one-chat boolean?]
   [:password-protected boolean?]
   [:default-notification-enabled boolean?]
   [:moderator-only-one-to-one-chat boolean?]
   [:enable-channels boolean?]])

(defn map->snake [m]
  {:pre [(-> m first (= :map))
         (map? (second m))]}
  (into [:map (second m)]
        (mapv (fn [[k v]]
                [(->snake_case k) v])
              (subvec m 2))))

(def UserInfo
  [:map {:closed true}
   [:created :string]
   [:created-using-api :boolean]
   [:deactivated {:optional true} :boolean]
   [:email :string]
   [:external-user-id :string]
   [:id :string]
   [:is-moderator [:maybe :boolean]]
   [:provisioned :boolean]
   [:unique-user-identifier :string]
   [:updated :string]
   [:username [:maybe :string]]])

(def Members
  [:map
   {}
   [:limit :int]
   [:total :int]
   [:skip :int]
   [:data [:vector UserInfo]]])

(def UserInfoSnakeCase (map->snake UserInfo))

(def MembersSnakeCase
  [:map
   [:limit :int]
   [:total :int]
   [:skip :int]
   [:data [:vector UserInfoSnakeCase]]])

(def Message
  [:map {:closed true}
   [:message :string]
   [:created :string]
   [:chat-account-id :string]
   [:username :string]])

(def Messages
  [:map
   {}
   [:limit :int]
   [:total-records :int]
   [:messages [:vector Message]]
   [:count :int]
   [:skip :int]])

(def ExtendedChannel
  (-> Channel
      (mu/assoc :members Members)
      (mu/assoc :messages Messages)))

(def ChannelSnakeCase (map->snake Channel))

(def MessageSnakeCase (map->snake Message))

(def MessagesSnakeCase [:map
                        {}
                        [:limit :int]
                        [:total_records :int]
                        [:messages [:vector MessageSnakeCase]]
                        [:count :int]
                        [:skip :int]])

(def ExtendedChannelSnakeCase
  #_(->)
  ChannelSnakeCase
  ;; IDK why these fail:
  #_(mu/assoc :members MembersSnakeCase)
  #_(mu/assoc :messages MessagesSnakeCase))

(def Channels
  [:sequential Channel])

(def NewDiscussion
  [:map
   {:closed true}
   [:name :string]])

(def Discussion
  [:map {:closed true}
   [:id :string]
   [:channel-id :string]
   [:notify-all-users :boolean]
   [:name :string]
   [:enabled :boolean]])

(def DiscussionSnakeCase
  (map->snake Discussion))

(util.malli/defprotocol Chat
  :extend-via-metadata true
  (add-user-to-private-channel [this user-id channel-id])

  (add-user-to-public-channel [this user-id channel-id])

  (^{:schema [:or
              (success-with :discussion Discussion)
              (failure-with :error-details any?)]}
    create-channel-discussion [this channel-id discussion-attrs])

  (^{:schema [:or
              (success-with)
              (failure-with :error-details any?)]}
    delete-channel-discussion [this channel-id discussion-id])

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

  (^{:schema [:or
              (success-with :discussions [:sequential Discussion])
              (failure-with :error-details any?)]}
    get-channel-discussions [this channel-id])

  (get-private-channels [this opts])

  (get-public-channels [this opts])

  (get-user-info [this user-id opts])

  (get-user-joined-channels [this user-id])

  (remove-user-from-channel [this user-id channel-id channel-type])

  (set-private-channel-custom-fields [this channel-id custom-fields])

  (set-public-channel-custom-fields [this channel-id custom-fields])

  (set-user-account-active-status [this user-id active? opts] "Activates/deactivates a user account, according to the `active?` parameter.")

  (update-user-account [this user-id updates]))
