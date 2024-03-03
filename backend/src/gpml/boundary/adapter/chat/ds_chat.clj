(ns gpml.boundary.adapter.chat.ds-chat
  "Dead Simple Chat (deadsimplechat.com) adapter"
  (:require
   [camel-snake-kebab.core :refer [->kebab-case]]
   [camel-snake-kebab.extras :as cske]
   [clojure.java.io :as io]
   [clojure.set :as set]
   [clojure.string :as string]
   [duct.logger :refer [log]]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.util :refer [url?]]
   [gpml.util.http-client :as http-client]
   [gpml.util.json :as json]
   [gpml.util.malli :refer [check! failure-with success-with]]
   [integrant.core :as ig]
   [malli.core :as malli]
   [taoensso.timbre :as timbre]))

(def ErrorDetails
  any?)

(def DSCInternalId
  (malli/schema [:and
                 [:string {:doc "DSC Internal Id"}]
                 [:fn (fn [s]
                        (not (string/starts-with? s "dscuui_")))]]))

;; XXX validate as uuid?
(def ExternalUserId
  (malli/schema [:string {:doc "Our id - used for easily correlating our User objects to theirs"}]))

(def UniqueUserIdentifier
  (malli/schema [:and
                 string?
                 #"^dscuui_.*"]
                {:doc (str "Must be opaque and complex enough to serve as authentication.\n"
                           "Starts with a fixed 'dscuui_' prefix, making it easily identifiable and Malli-able.")}))

(def NewUser
  [:map {:closed true}
   [:uniqueUserIdentifier UniqueUserIdentifier]
   [:externalUserId ExternalUserId]
   [:isModerator boolean?]
   [:email string?]
   [:profilePic {:optional true} [:maybe string?]]
   [:username string?]])

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

(def CreatedUser
  [:map
   [:username string?]
   [:user-id DSCInternalId]
   [:is-moderator boolean?]
   [:access-token string?]])

(defn- build-api-endpoint-url [endpoint-url-path & strs]
  {:pre  [(check! [:and :string [:fn (fn starts-with-slash [s]
                                       (string/starts-with? s "/"))]]
                  endpoint-url-path

                  [:maybe [:sequential :string]]
                  strs)]
   :post [(check! url? %)]}
  (apply str "https://api.deadsimplechat.com/consumer" endpoint-url-path strs))

(defn make-unique-user-identifier []
  {:post [(check! UniqueUserIdentifier %)]}
  (str "dscuui_" (random-uuid)))

(defn get-user-info* [{:keys [logger api-key]} user-id _opts]
  {:pre  [(check! UniqueUserIdentifier user-id)]
   :post [(check! [:or
                   (success-with :user UserInfo)
                   (failure-with :error-details ErrorDetails)]
                  %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url          (build-api-endpoint-url "/api/v2/user/" user-id)
                              :method       :get
                              :query-params {:auth api-key}
                              :content-type :json
                              :as           :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       ;; deactivated true is included for deactivated users (otherwise it's absent, unless it has been reactivated)
       :user     (select-keys (cske/transform-keys ->kebab-case body)
                              [:created
                               :created-using-api
                               :deactivated
                               :email
                               :external-user-id
                               :id
                               :is-moderator
                               :provisioned
                               :unique-user-identifier
                               :updated
                               :username])}
      {:success?      false
       :reason        :failed-to-get-user-info
       :error-details body})))

(defn create-user-account* [{:keys [logger api-key]} user]
  {:pre  [(check! NewUser user)]
   :post [(check! [:or
                   (success-with :user CreatedUser)
                   (failure-with :error-details ErrorDetails)]
                  %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/user")
                              :query-params {:auth api-key}
                              :method :post
                              :body (json/->json user)
                              :content-type :json
                              :as :json-keyword-keys})
        obj (cske/transform-keys ->kebab-case body)]
    (timbre/with-context+ {:user user}
      (if (<= 200 status 299)
        (do
          (log logger :info :created-chat-user)
          {:success? true
           :user (-> obj
                     (select-keys [:username :user-id :is-moderator :access-token]))})
        (do
          (log logger :warn :failed-to-create-chat-user)
          {:success? false
           :reason :failed-to-create-user-account
           :error-details body})))))

(def RoomId string?)

(def UserUpdates
  [:map {:closed true}
   [:chatRoom {:optional true
               :doc (str "roomId of the chatRoom you want to link the user to.\n"
                         "When creating a moderator, if chatRoom is passed then the user \n"
                         "will be the moderator of the specified chatRoom.\n"
                         "If chatRoom is not specified, then the user will be the moderator of all chatRooms.")}
    RoomId]
   [:externalUserId {:optional true}
    ExternalUserId]
   [:isModerator {:optional true}
    boolean?]
   [:email {:optional true}
    string?]
   [:profilePic {:optional true}
    string?]
   [:meta {:optional true}
    string?]
   [:username {:optional true}
    string?]])

(defn update-user-account* [{:keys [logger api-key]} dsc-internal-user-id updates]
  {:pre  [(check! DSCInternalId dsc-internal-user-id
                  UserUpdates   updates)]
   :post [(check! [:or
                   (success-with)
                   (failure-with :error-details ErrorDetails)]
                  %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/user")
                              :method :put
                              :query-params {:auth api-key}
                              :body (-> updates
                                        (assoc :userId dsc-internal-user-id)
                                        json/->json)
                              :content-type :json
                              :as :json-keyword-keys})]
    (timbre/with-context+ {:dsc-internal-user-id dsc-internal-user-id
                           :updates updates}
      (if (<= 200 status 299)
        (do
          (log logger :info :updated-user-account)
          {:success? true})
        (do
          (log logger :warn :failed-to-update-user-account)
          {:success? false
           :reason :failed-to-update-user-account
           :error-details body})))))

(defn delete-user-account* [{:keys [logger api-key]} user-id _opts]
  {:pre  [(check! UniqueUserIdentifier user-id)]
   :post [(check! [:or
                   (success-with)
                   (failure-with :error-details ErrorDetails)]
                  %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v2/user")
                              :method :delete
                              :query-params {:auth api-key}
                              :body (json/->json {:uniqueUserIdentifier user-id})
                              :content-type :json
                              :as :json-keyword-keys})]
    (timbre/with-context+ {:user-id user-id}
      (if (<= 200 status 299)
        (do
          (log logger :info :deleted-user-account)
          {:success? true})
        (do
          (log logger :warn :failed-to-delete-user-account)
          {:success? false
           :reason :failed-to-delete-user-account
           :error-details body})))))

(defn set-user-account-active-status* [{:keys [logger api-key]} user-id active? _opts]
  {:pre  [(check! UniqueUserIdentifier user-id
                  boolean? active?)]
   :post [(check! [:or
                   (success-with :message :string)
                   (failure-with :error-details ErrorDetails)]
                  %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url (if active?
                                                             "/api/v2/user/reactivate"
                                                             "/api/v2/user/deactivate"))
                              :method (if active?
                                        :post
                                        :delete)
                              :query-params {:auth api-key}
                              :body (json/->json {:uniqueUserIdentifier user-id})
                              :as :json-keyword-keys})]
    (timbre/with-context+ {:user-id user-id
                           :active? active?}
      (if (<= 200 status 299)
        (let [message (:message body)]
          (log logger :info :successfully-updated-active-status {:message message})
          {:success? true
           :message message})
        (do
          (log logger :warn :failed-to-update-active-status)
          {:success? false
           :reason :failed-to-set-user-account-active-status
           :error-details body})))))

(def Channel
  [:map
   [:show_notification_for_all_channels boolean?]
   [:name string?]
   [:enable_like_message boolean?]
   [:room_id string?]
   [:enable_one_to_one_chat boolean?]
   [:password_protected boolean?]
   [:default_notification_enabled boolean?]
   [:moderator_only_one_to_one_chat boolean?]
   [:enable_channels boolean?]])

(defn get-all-channels* [{:keys [logger api-key]} _opts]
  {:post [(check! #'port.chat/get-all-channels %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatrooms")
                              :method :get
                              :query-params {:auth api-key}
                              :as :json-keyword-keys})]
    (if-not (<= 200 status 299)
      {:success? false
       :reason :failed-to-get-channels
       :error-details {:result body}}
      {:success? true
       ;; XXX there's no way to distinguish private from public channels
       :channels (mapv (fn [channel]
                         (set/rename-keys (cske/transform-keys ->kebab-case channel)
                                          {:room-id :id}))
                       body)})))

(defn get-channel* [{:keys [logger api-key]} channel-id]
  {:pre  [(check! RoomId channel-id)]
   :post [(check! #'port.chat/get-channel %)]}
  (let [{:keys [status]
         channel :body}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/" channel-id)
                              :method :get
                              :query-params {:auth api-key}
                              :as :json-keyword-keys})]
    (if-not (<= 200 status 299)
      {:success? false
       :reason :failed-to-get-channels
       :error-details {:result channel}}
      (let [{:keys [status]
             members :body}
            (http-client/request logger
                                 {:url (build-api-endpoint-url "/api/v2/room/" channel-id "/members")
                                  :method :get
                                  :query-params {:auth api-key
                                                 :limit "200"}
                                  :as :json-keyword-keys})]
        (if-not (<= 200 status 299)
          {:success? false
           :reason :failed-to-get-members
           :error-details {:result members}}
          (let [{:keys [status]
                 messages :body}
                (http-client/request logger
                                     {:url (build-api-endpoint-url "/api/v1/chatRoom/" channel-id "/messages")
                                      :method :get
                                      :query-params {:auth api-key
                                                     :limit "1"}
                                      :as :json-keyword-keys})]
            (if-not (<= 200 status 299)
              {:success? false
               :reason :failed-to-get-messages
               :error-details {:result messages}}
              {:success? true
               :channel (-> (cske/transform-keys ->kebab-case channel)
                            (set/rename-keys {:room-id :id})
                            (assoc :members  (cske/transform-keys ->kebab-case members))
                            (assoc :messages (cske/transform-keys ->kebab-case messages)))})))))))

(def UserJoinedChanels
  [:sequential
   [:map {:closed true}
    [:name string?]
    [:id string?]
    [:role-name string?]]])

(defn get-user-joined-channels* [{:keys [logger api-key]} user-id]
  {:pre  [(check! UniqueUserIdentifier user-id)]
   :post [(check! [:or
                   (success-with :channels UserJoinedChanels)
                   (failure-with :error-details ErrorDetails)]
                  %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v2/user/" user-id "/rooms")
                              :method :get
                              :query-params {:auth api-key}
                              :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :channels (into []
                       (comp (map #(cske/transform-keys ->kebab-case %))
                             (filter :chat-room) ;; DSC can include memeberships to deleted channels
                             (map (fn [{:keys [role-name]
                                        {:keys [name room-id]} :chat-room}]
                                    {:name name
                                     :id room-id
                                     :role-name role-name})))
                       body)}
      {:success? false
       :reason :failed-to-add-user-to-channel
       :error-details body})))

(defn remove-user-from-channel* [{:keys [logger api-key]} user-id channel-id _]
  {:pre  [(check! UniqueUserIdentifier user-id
                  RoomId channel-id)]
   :post [(check! [:or
                   (success-with)
                   (failure-with :error-details ErrorDetails)]
                  %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v2/room/" channel-id "/member")
                              :method :delete
                              :query-params {:auth api-key}
                              :body (json/->json {:uniqueUserIdentifier user-id})
                              :as :json-keyword-keys})]
    (timbre/with-context+ {:user-id user-id
                           :channel-id channel-id}
      (if (<= 200 status 299)
        (do
          (log logger :info :removed-user-from-channel)
          {:success? true})
        (do
          (log logger :warn :failed-to-remove-user-from-channel)
          {:success? false
           :reason :failed-to-remove-user-from-channel
           :error-details body})))))

(defn add-user-to-channel* [{:keys [logger api-key]} user-id channel-id]
  {:pre  [(check! UniqueUserIdentifier user-id
                  RoomId               channel-id)]
   :post [(check! [:or
                   (success-with)
                   (failure-with :error-details ErrorDetails)]
                  %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v2/room/" channel-id "/member")
                              :method :post
                              :query-params {:auth api-key}
                              :body (json/->json {:uniqueUserIdentifier user-id
                                                  ;; https://deadsimplechat.com/developer/platform-guides/new-join-modal-guide/#member-roles
                                                  :roleName "user"})
                              :as :json-keyword-keys})]
    (timbre/with-context+ {:channel-id channel-id
                           :user-id user-id}
      (if (<= 200 status 299)
        (do
          (log logger :info :added-user-to-channel)
          {:success? true})
        (do
          (log logger :warn :could-not-add-user-to-channel)
          {:success? false
           :reason :failed-to-add-user-to-channel
           :error-details body})))))

(def NewChannel
  [:map {:closed true}
   [:name string?]
   [:description {:optional true} [:maybe string?]]])

(def public-permission-level "provisioned_users")

(def private-permission-level "members")

(def custom-css
  (delay
    (slurp (io/resource "ds_chat/custom.css"))))

(def CreatedChannel [:map
                     [:id string?]
                     [:url string?]])

(defn create-channel* [{:keys [logger api-key]} channel permission-level]
  {:pre  [(check! NewChannel channel
                  [:enum public-permission-level private-permission-level] permission-level)]
   :post [(check! [:or
                   (success-with :channel CreatedChannel)
                   (failure-with :error-details ErrorDetails)]
                  %)]}
  (let [req-body (cond-> channel
                   (:description channel) (assoc :description (:description channel))
                   true (assoc :defaultNotificationEnabled "off"
                               :customization {"hideSidebar" true
                                               "fontFamily" "DM Sans",
                                               "useCustomFont" true,
                                               "hideHeader" true,
                                               "hideUniqueUserIdentifierField" true,
                                               "hideAccessTokenField" true,
                                               "buttonColor" "#020a5b",
                                               "buttonHoverColor" "#ffffff",
                                               "buttonTextColor" "#020a5b",
                                               "sendButtonIconColor" "#ffffff",
                                               "sendButtonBackgroundColor" "#020a5b",
                                               "textareaBackgroundColor" "#f5f7ff",
                                               "chatMessageHoverColor" "#f5f7ff",
                                               "modalFontColor" "#020a5b"}
                               :customCSS @custom-css
                               :name (:name channel)
                               :fileSharingMode "fileAndImageSharing"
                               :chatRoomPermissionLevel permission-level
                               :enableChannels "on"))
        {:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/")
                              :query-params {:auth api-key}
                              :method :post
                              :body (json/->json req-body)
                              :as :json-keyword-keys})]
    (timbre/with-context+ {:channel channel
                           :permission-level permission-level}
      (if (<= 200 status 299)
        (do
          (log logger :info :successfully-created-channel)
          {:success? true
           :channel (set/rename-keys (select-keys (cske/transform-keys ->kebab-case body) [:room-id :url])
                                     {:room-id :id})})
        (do
          (log logger :warn :failed-to-create-channel)
          {:success? false
           :reason :failed-to-create-channel
           :error-details body})))))

(defn create-public-channel* [adapter channel]
  (create-channel* adapter channel public-permission-level))

(defn create-private-channel* [adapter channel]
  (create-channel* adapter channel private-permission-level))

(def NewDiscussion
  [:map {:closed true}
   [:room-id RoomId]
   [:name string?]])

(def Discussion
  [:map {:closed true}
   [:channel-id :string]
   [:notify-all-users :boolean]
   [:name :string]
   [:enabled :boolean]])

(defn extract-discussion [body]
  (set/rename-keys (select-keys (cske/transform-keys ->kebab-case body)
                                [:room-id :notify-all-users :channel-name :enabled])
                   {:room-id :channel-id
                    :channel-name :name}))

(defn create-discussion* [{:keys [logger api-key]} discussion]
  {:pre  [(check! NewDiscussion discussion)]
   :post [(check! [:or
                   (success-with :discussion Discussion)
                   (failure-with :error-details ErrorDetails)]
                  %)]}
  (let [req-body {:enabled true
                  :notifyAllUsers false
                  :channelName (:name discussion)}
        {:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/" (:room-id discussion) "/channel")
                              :query-params {:auth api-key}
                              :method :post
                              :body (json/->json req-body)
                              :as :json-keyword-keys})]
    (timbre/with-context+ {:discussion discussion}
      (if (<= 200 status 299)
        (do
          (log logger :info :successfully-created-discussion)
          {:success? true
           :discussion (extract-discussion body)})
        (do
          (log logger :warn :failed-to-create-discussion)
          {:success? false
           :reason :failed-to-create-discussion
           :error-details body})))))

(defn delete-channel* [{:keys [logger api-key]} channel-id]
  {:pre  [(check! RoomId channel-id)]
   :post [(check! [:or
                   (success-with)
                   (failure-with :error-details ErrorDetails)]
                  %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/" channel-id)
                              :method :delete
                              :query-params {:auth api-key}
                              :as :json-keyword-keys})]
    (timbre/with-context+ {:channel-id channel-id}
      (if (<= 200 status 299)
        (do
          (log logger :info :successfully-deleted-channel)
          {:success? true})
        (do
          (log logger :warn :could-not-delete-channel)
          {:success? false
           :reason :failed-to-delete-public-channel
           :error-details body})))))

(def ChannelUpdates
  [:map {:closed true}
   [:description {:optional true}
    string?]
   [:name {:optional true}
    string?]])

(defn set-channel-custom-fields* [{:keys [logger api-key]} channel-id custom-fields]
  {:pre  [(check! RoomId channel-id
                  ChannelUpdates custom-fields)]
   :post [(check! [:or
                   (success-with :channel CreatedChannel)
                   (failure-with :error-details ErrorDetails)]
                  %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/" channel-id)
                              :method :put
                              :query-params {:auth api-key}
                              :body (json/->json custom-fields)
                              :as :json-keyword-keys})]
    (timbre/with-context+ {:channel-id channel-id
                           :custom-fields custom-fields}
      (if (<= 200 status 299)
        (do
          (log logger :info :successfully-set-channel-custom-fields)
          {:success? true
           :channel {:id (:roomId body)
                     :url (:url body)}})
        (do
          (log logger :warn :failed-to-set-channel-custom-fields)
          {:success? false
           :reason :failed-to-set-public-channel-custom-fields
           :error-details body})))))

(defn get-channel-discussions* [{:keys [logger api-key]} channel-id]
  {:pre  [channel-id]
   :post [(check! [:or
                   (success-with :discussions [:sequential Discussion])
                   (failure-with :error-details ErrorDetails)]
                  %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/" channel-id "/channels")
                              :method :get
                              :query-params {:auth api-key}
                              :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :discussions (mapv extract-discussion body)}
      {:success? false
       :reason :failed-to-get-channel-discussions
       :error-details body})))

(defn map->DSChat [m]
  {:pre [(check! [:map
                  [:api-key string?]
                  [:logger some?]]
                 m)]}
  (with-meta m
    {`port.chat/add-user-to-private-channel       add-user-to-channel*
     `port.chat/add-user-to-public-channel        add-user-to-channel*
     `port.chat/create-private-channel            create-private-channel*
     `port.chat/create-public-channel             create-public-channel*
     `port.chat/create-user-account               create-user-account*
     `port.chat/delete-private-channel            delete-channel*
     `port.chat/delete-public-channel             delete-channel*
     `port.chat/delete-user-account               delete-user-account*
     `port.chat/get-channel                       get-channel*
     `port.chat/get-all-channels                  get-all-channels*
     `port.chat/get-private-channels              get-all-channels*
     `port.chat/get-public-channels               get-all-channels*
     `port.chat/get-channel-discussions           get-channel-discussions*
     `port.chat/get-user-info                     get-user-info*
     `port.chat/get-user-joined-channels          get-user-joined-channels*
     `port.chat/remove-user-from-channel          remove-user-from-channel*
     `port.chat/set-private-channel-custom-fields set-channel-custom-fields*
     `port.chat/set-public-channel-custom-fields  set-channel-custom-fields*
     `port.chat/set-user-account-active-status    set-user-account-active-status*
     `port.chat/update-user-account               update-user-account*}))

(defmethod ig/init-key :gpml.boundary.adapter.chat/ds-chat
  [_ config]
  (map->DSChat config))

(comment
  (let [{:keys [id email first_name last_name]} (dev/make-user! (format "a%s@a%s.com" (random-uuid) (random-uuid)))]

    @(def uniqueUserIdentifier (make-unique-user-identifier))

    @(def a-user (port.chat/create-user-account (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                                {:uniqueUserIdentifier uniqueUserIdentifier
                                                 :externalUserId (str id)
                                                 :isModerator false
                                                 :email email
                                                 :username (str first_name " " last_name)})))

  (port.chat/update-user-account (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                 (-> a-user :user :user-id)
                                 {:email (format "a%s@a%s.com" (random-uuid) (random-uuid))})

  (port.chat/get-user-info (dev/component :gpml.boundary.adapter.chat/ds-chat)
                           uniqueUserIdentifier
                           {})

  (port.chat/set-user-account-active-status (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                            uniqueUserIdentifier
                                            false
                                            {})

  (port.chat/set-user-account-active-status (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                            uniqueUserIdentifier
                                            true
                                            {})

  @(def a-public-channel (port.chat/create-public-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                                          {:name (str (random-uuid))}))

  @(def a-private-channel (port.chat/create-private-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                                            {:name (str (random-uuid))}))

  ;; (not defined in the protocol)
  (create-discussion* (dev/component :gpml.boundary.adapter.chat/ds-chat)
                      {:room-id (-> a-public-channel :channel :id)
                       :name (str (random-uuid))})

  (port.chat/get-channel-discussions (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                     (-> a-public-channel :channel :id))

  (port.chat/set-private-channel-custom-fields (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                               (-> a-public-channel :channel :id)
                                               {:description (str (random-uuid))
                                                :name (str (random-uuid))})

  (port.chat/add-user-to-public-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                        uniqueUserIdentifier
                                        (-> a-public-channel :channel :id))

  (port.chat/get-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                         (-> a-public-channel :channel :id))

  (port.chat/add-user-to-private-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                         uniqueUserIdentifier
                                         (-> a-private-channel :channel :id))

  @(def all-chanels (port.chat/get-all-channels (dev/component :gpml.boundary.adapter.chat/ds-chat) {}))

  (port.chat/get-user-joined-channels (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                      uniqueUserIdentifier)

  (port.chat/remove-user-from-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                      uniqueUserIdentifier
                                      (-> a-public-channel :channel :id)
                                      {})

  ;; Should be smaller now
  (-> (port.chat/get-user-joined-channels (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                          uniqueUserIdentifier)
      :channels
      count)

  (port.chat/delete-user-account (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                 uniqueUserIdentifier
                                 {})

  (port.chat/delete-public-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                   (-> a-public-channel :channel :id))

  (port.chat/delete-private-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                    (-> a-private-channel :channel :id))

  (doseq [{:keys [id]} (:channels (port.chat/get-all-channels (dev/component :gpml.boundary.adapter.chat/ds-chat) {}))]
    (port.chat/delete-public-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                     id)))
