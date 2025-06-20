(ns gpml.boundary.port.chat
  (:require
   [clojure.string :as string]
   [gpml.util.malli :as util.malli :refer [failure-with map->snake success-with]]
   [java-time.api :as jt]
   [malli.util :as mu]))

(def DSCInternalId
  [:and
   [:string {:doc "DSC Internal Id"}]
   [:fn (fn [s]
          (not (string/starts-with? s "dscuui_")))]])

(def ExternalUserId
  [:string {:doc "Our id - used for easily correlating our User objects to theirs"}])

(def UniqueUserIdentifier
  [:and
   {:doc (str "Must be opaque and complex enough to serve as authentication.\n"
              "Starts with a fixed 'dscuui_' prefix, making it easily identifiable and Malli-able.")
    :gen/return (str "dscuui_" (random-uuid))}
   :string
   #"^dscuui_.*"])

(def private "private")

(def public "public")

(def ChannelPrivacy
  [:enum public private])

(def ChannelDescription
  [:string {:max
            ;; Mirror DSC's limit
            500}])

(def Channel ;; TODO https://clojurians.slack.com/archives/CLDK6MFMK/p1709154587503499
  [:map
   {:closed true}
   [:privacy ChannelPrivacy]
   [:metadata {:optional true} map?]
   [:show-notification-for-all-channels boolean?]
   [:name :string]
   [:description {:optional true} ChannelDescription]
   [:enable-like-message boolean?]
   [:id :string]
   [:enable-one-to-one-chat boolean?]
   [:password-protected boolean?]
   [:default-notification-enabled boolean?]
   [:moderator-only-one-to-one-chat boolean?]
   [:enable-channels boolean?]])

(def channel-keys
  (into []
        (comp (filter vector?)
              (map first))
        Channel))

(def UserInfo
  [:map {:closed true}
   [:created :string]
   [:created-using-api :boolean]
   [:deactivated {:optional true} :boolean]
   [:profile-pic {:optional true} [:maybe {} :string]]
   [:email :string]
   [:external-user-id :string]
   [:id :string]
   [:is-moderator [:maybe {} :boolean]]
   [:provisioned :boolean]
   [:unique-user-identifier :string]
   [:updated :string]
   [:username [:maybe {} :string]]])

(def Members
  [:map
   {}
   [:limit :int]
   [:total :int]
   [:skip :int]
   [:data [:vector {} UserInfo]]])

(def UserInfoSnakeCase (map->snake UserInfo))

(def MembersSnakeCase (map->snake Members))

(def Message
  [:map {:closed true}
   [:message :string]
   [:created {:gen/return (str (jt/instant))}
    [:and {:gen/return (str (jt/instant))}
     [:string {:gen/return (str (jt/instant))}]
     [:fn {:message "Must express a parseable date"}
      (fn try-parse-instant [s]
        (try
          (jt/instant s)
          true
          (catch Exception _
            false)))]]]
   [:discussion-id {:optional true} :string]
   [:conversation-id {:optional true} :string]
   [:chat-user-id {:optional true} :string]
   [:username :string]
   [:chat-account-id :string]
   [:unique-user-identifier UniqueUserIdentifier]])

(def Messages
  [:map
   {}
   [:limit :int]
   [:total-records :int]
   [:messages [:vector {} Message]]
   [:count :int]
   [:skip :int]])

(def Discussion
  [:map {:closed true}
   [:id :string]
   [:channel-id :string]
   [:notify-all-users :boolean]
   [:name :string]
   [:enabled :boolean]])

(def ExtendedDiscussion
  (-> Discussion
      (mu/assoc :messages [:vector {} Message])))

(def ConversationMember
  [:map
   {}
   [:id :string]
   [:email :string]
   [:username :string]
   [:unique-user-identifier UniqueUserIdentifier]])

(def Conversation
  [:map {:closed true}
   [:conversation-id :string]
   [:channel-id :string]
   [:member-one ConversationMember]
   [:member-two ConversationMember]])

(def ConversationWithMessages
  (-> Conversation
      (mu/assoc :messages [:vector {} Message])))

(def ConversationSnakeCase (map->snake Conversation))

(def ExtendedChannel
  (-> Channel
      (mu/assoc :members Members)
      (mu/assoc :messages Messages)
      (mu/assoc :discussions [:vector {} ExtendedDiscussion])
      (mu/assoc :conversations [:vector {} ConversationWithMessages])))

(def ChannelSnakeCase (map->snake Channel))

(def MessageSnakeCase (map->snake Message))

(def MessagesSnakeCase ;; removes sensitive fields that shouldn't be returned over HTTP.
  (let [updated? (volatile! false)
        updated2? (volatile! false)
        result (mapv (fn [x]
                       (cond->> x
                         (and (vector? x) (-> x first (= :messages)))
                         (mapv (fn [y]
                                 (cond->> y
                                   (and (vector? y) (-> y first (= :vector)))
                                   (mapv (fn [z]
                                           (if-not (and (vector? z) (-> z first (= :map)))
                                             z
                                             (into []
                                                   (remove (fn [chat-account-id]
                                                             (or (when (and (vector? chat-account-id)
                                                                            (= (first chat-account-id) :chat-account-id))
                                                                   (vreset! updated? true)
                                                                   true)
                                                                 (when (and (vector? chat-account-id)
                                                                            (= (first chat-account-id) :unique-user-identifier))
                                                                   (vreset! updated2? true)
                                                                   true))))
                                                   z)))))))))
                     (map->snake Messages))]
    (assert @updated?)
    (assert @updated2?)
    result))

(def Org
  [:map {:closed true}
   [:name {:optional true} :string]])

(def PresentedUser
  [:map
   {:closed true}
   [:picture_file any?]
   [:first_name any?]
   [:picture_id any?]
   [:org Org]
   [:id any?]
   [:picture any?]
   [:last_name any?]
   [:chat_user_id {:optional true} any?]])

(def PresentedUserSnakeCase (map->snake PresentedUser))

(def ChannelWithUsersSnakeCase
  (-> ChannelSnakeCase
      (mu/assoc :users [:vector {} PresentedUserSnakeCase])))

(def ExtendedChannelSnakeCase
  (-> ChannelSnakeCase
      (mu/assoc :users [:vector {} PresentedUserSnakeCase])
      (mu/assoc :conversations [:vector {} ConversationSnakeCase])
      (mu/assoc :messages MessagesSnakeCase)))

(def Channels
  [:sequential Channel])

(def NewChannel
  [:map {:closed true}
   [:name :string]
   [:description {:optional true} :string]
   [:privacy ChannelPrivacy]])

(def ChannelEdit
  [:map {:closed true}
   [:name  {:optional true} :string]
   [:description {:optional true} ChannelDescription]])

(def NewDiscussion
  [:map
   {:closed true}
   [:name :string]])

(def DiscussionSnakeCase
  (map->snake Discussion))

(def CreatedUser
  [:map
   [:username :string]
   [:user-id DSCInternalId]
   [:is-moderator boolean?]
   [:access-token :string]])

(def CreatedChannel [:map
                     {}
                     [:id :string]
                     [:url :string]])

(def CreatedChannelSnakeCase (map->snake CreatedChannel))

(util.malli/defprotocol Chat
  :extend-via-metadata true
  (^{:schema [:or
              (success-with)
              (failure-with :error-details any?)]}
    add-user-to-private-channel [this user-id channel-id])

  (^{:schema [:or
              (success-with)
              (failure-with :error-details any?)]}
    add-user-to-public-channel [this user-id channel-id])

  (^{:schema [:or
              (success-with :discussion Discussion)
              (failure-with :error-details any?)]}
    create-channel-discussion [this channel-id discussion-attrs])

  (^{:schema [:or
              (success-with)
              (failure-with :error-details any?)]}
    delete-channel-discussion [this channel-id discussion-id])

  (^{:schema [:or
              (success-with :channel CreatedChannel)
              (failure-with :error-details any?)]}
    create-private-channel [this channel])

  (^{:schema [:or
              (success-with :channel CreatedChannel)
              (failure-with :error-details any?)]}
    create-public-channel [this channel])

  (^{:schema [:or
              (success-with :user CreatedUser)
              (failure-with :error-details any?)]}
    create-user-account [this user])

  (^{:schema [:or
              (success-with)
              (failure-with :error-details any?)]}
    delete-private-channel [this channel-id])

  (^{:schema [:or
              (success-with)
              (failure-with :error-details any?)]}
    delete-public-channel [this channel-id])

  (^{:schema [:or
              (success-with)
              (failure-with :error-details any?)]}
    delete-user-account [this user-id opts])

  (^{:schema [:or
              (success-with :channels Channels)
              (failure-with :error-details any?)]}
    get-all-channels [this opts])

  (^{:schema [:or
              (success-with :channel ExtendedChannel)
              (failure-with :error-details any?)]}
    get-channel [this channel-id include-discussion-messages?])

  (^{:schema [:or
              (success-with :messages [:vector Message])
              (failure-with :error-details any?)]}
    get-discussion-messages [this channel-id discussion-id])

  (^{:schema [:or
              (success-with :discussions [:sequential Discussion])
              (failure-with :error-details any?)]}
    get-channel-discussions [this channel-id])

  (^{:schema [:or
              (success-with :conversations [:sequential Conversation])
              (failure-with :error-details any?)]}
    get-channel-conversations [this channel-id])

  (^{:schema [:or
              (success-with :user-ids [:sequential any? #_UniqueUserIdentifier]) ;; XXX I'm assuming it returns such ids. Can be requested.
              (failure-with :error-details any?)]}
    get-channel-present-users [this channel-id]
    "Returns the User IDs of the users currently active in the given channel.")

  (^{:schema [:or
              (success-with :channels Channels)
              (failure-with :error-details any?)]}
    get-private-channels [this opts])

  (^{:schema [:or
              (success-with :channels Channels)
              (failure-with :error-details any?)]}
    get-public-channels [this opts])

  (^{:schema [:or
              (success-with :user UserInfo)
              (failure-with :error-details any?)]}
    get-user-info [this user-id opts])

  (^{:schema [:or
              (success-with :channels Channels)
              (failure-with :error-details any?)]}
    get-user-joined-channels [this user-id extra-channel-ids])

  (^{:schema [:or
              (success-with)
              (failure-with :error-details any?)]}
    remove-user-from-channel [this user-id channel-id channel-type])

  (^{:schema [:or
              (success-with :channel CreatedChannel)
              (failure-with :error-details any?)]}
    set-private-channel-custom-fields [this channel-id custom-fields])

  (^{:schema [:or
              (success-with :channel CreatedChannel)
              (failure-with :error-details any?)]}
    set-public-channel-custom-fields [this channel-id custom-fields])

  (^{:schema [:or
              (success-with :message :string)
              (failure-with :error-details any?)]}
    set-user-account-active-status [this user-id active? opts]
    "Activates/deactivates a user account, according to the `active?` parameter.")

  (^{:schema [:or
              (success-with)
              (failure-with :error-details any?)]}
    update-user-account [this user-id updates]))
