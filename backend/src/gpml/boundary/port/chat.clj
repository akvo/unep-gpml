(ns gpml.boundary.port.chat
  (:require
   [camel-snake-kebab.core :refer [->snake_case]]
   [clojure.string :as string]
   [gpml.util.malli :as util.malli :refer [check! failure-with success-with]]
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
              "Starts with a fixed 'dscuui_' prefix, making it easily identifiable and Malli-able.")}
   string?
   #"^dscuui_.*"])

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

(defn map->snake [[id :as m]]
  {:pre [(check! [:enum :map :vector] id
                 [:fn map?] (second m))]}
  (into [id (second m)]
        (mapv (fn [[k x y & args]]
                (into []
                      (remove nil?)
                      (apply vector
                             (->snake_case k)
                             (cond-> x
                               (and (vector? x) (-> x first #{:vector :map})) map->snake)
                             (cond-> y
                               (and (vector? y) (-> y first #{:vector :map})) map->snake)
                             args)))
              (subvec m 2))))

(def UserInfo
  [:map {:closed true}
   [:created :string]
   [:created-using-api :boolean]
   [:deactivated {:optional true} :boolean]
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
   [:created :string]
   [:chat-account-id :string]
   [:username :string]])

(def Messages
  [:map
   {}
   [:limit :int]
   [:total-records :int]
   [:messages [:vector {} Message]]
   [:count :int]
   [:skip :int]])

(def ExtendedChannel
  (-> Channel
      (mu/assoc :members Members)
      (mu/assoc :messages Messages)))

(def ChannelSnakeCase (map->snake Channel))

(def MessageSnakeCase (map->snake Message))

(def MessagesSnakeCase (map->snake Messages))

(def Org
  [:map {:closed true}
   [:name :string]])

(def PresentedUser
  [:map
   {:closed true}
   [:picture_file any?]
   [:first_name any?]
   [:picture_id any?]
   [:org Org]
   [:id any?]
   [:picture any?]
   [:last_name any?]])

(def PresentedUserSnakeCase (map->snake PresentedUser))

(def ChannelWithUsersSnakeCase
  (-> ChannelSnakeCase
      (mu/assoc :users [:vector {} PresentedUserSnakeCase])))

(def ExtendedChannelSnakeCase
  (-> ChannelSnakeCase
      (mu/assoc :users [:vector {} PresentedUserSnakeCase])
      (mu/assoc :messages MessagesSnakeCase)))

(def Channels
  [:sequential Channel])

(def NewChannel
  [:map {:closed true}
   [:name string?]
   [:description {:optional true} string?]
   [:privacy ChannelPrivacy]])

(def ChannelEdit
  [:map {:closed true}
   [:name  {:optional true} string?]
   [:description {:optional true} string?]])

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

(def CreatedUser
  [:map
   [:username string?]
   [:user-id DSCInternalId]
   [:is-moderator boolean?]
   [:access-token string?]])

(def CreatedChannel [:map
                     {}
                     [:id string?]
                     [:url string?]])

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
    get-channel [this channel-id])

  (^{:schema [:or
              (success-with :discussions [:sequential Discussion])
              (failure-with :error-details any?)]}
    get-channel-discussions [this channel-id])

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
