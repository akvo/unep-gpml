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
   [gpml.util.malli :refer [check!]]
   [integrant.core :as ig]
   [taoensso.timbre :as timbre]))

(def NewUser
  [:map {:closed true}
   [:uniqueUserIdentifier port.chat/UniqueUserIdentifier]
   [:externalUserId port.chat/ExternalUserId]
   [:isModerator boolean?]
   [:email string?]
   [:profilePic {:optional true} [:maybe string?]]
   [:username string?]])

(defn- build-api-endpoint-url [endpoint-url-path & strs]
  {:pre  [(check! [:and :string [:fn (fn starts-with-slash [s]
                                       (string/starts-with? s "/"))]]
                  endpoint-url-path

                  [:maybe [:sequential :string]]
                  strs)]
   :post [(check! url? %)]}
  (apply str "https://api.deadsimplechat.com/consumer" endpoint-url-path strs))

(defn make-unique-user-identifier []
  {:post [(check! port.chat/UniqueUserIdentifier %)]}
  (str "dscuui_" (random-uuid)))

(def user-info-keys
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
   :username])

(defn get-user-info* [{:keys [logger api-key]} user-id _opts]
  {:pre  [(check! port.chat/UniqueUserIdentifier user-id)]
   :post [(check! #'port.chat/get-user-info %)]}
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
                              user-info-keys)}
      {:success?      false
       :reason        :failed-to-get-user-info
       :error-details body})))

(defn create-user-account* [{:keys [logger api-key]} user]
  {:pre  [(check! NewUser user)]
   :post [(check! #'port.chat/create-user-account %)]}
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
    port.chat/ExternalUserId]
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

(defn update-user-account* [{:keys [logger api-key]} unique-user-identifier updates]
  {:pre  [(check! port.chat/UniqueUserIdentifier unique-user-identifier
                  UserUpdates                    updates)]
   :post [(check! #'port.chat/update-user-account %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/user")
                              :method :put
                              :query-params {:auth api-key}
                              :body (-> updates
                                        (assoc :uniqueUserIdentifier unique-user-identifier)
                                        json/->json)
                              :content-type :json
                              :as :json-keyword-keys})]
    (timbre/with-context+ {:unique-user-identifier unique-user-identifier
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
  {:pre  [(check! port.chat/UniqueUserIdentifier user-id)]
   :post [(check! #'port.chat/delete-user-account %)]}
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
  {:pre  [(check! port.chat/UniqueUserIdentifier user-id
                  boolean?                       active?)]
   :post [(check! #'port.chat/set-user-account-active-status %)]}
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

(defn present-channel [channel]
  {:post [(check! port.chat/Channel %)]}
  (let [has-metadata? (and (-> channel :metadata string?)
                           (not (-> channel :metadata string/blank?)))
        v (-> channel
              (set/rename-keys {:room-id :id
                                :chat-room-permission-level :privacy})
              (select-keys port.chat/channel-keys) ;; Ensure the :closed Channel schema is satisfied
              (update :privacy {"provisioned_users" "public"
                                "members"           "private"})
              (cond-> has-metadata? (update :metadata json/<-json)))]
    (cond-> v
      ;; :description is both optional and nilable for DSC. Our schema is stronger (optional, non-nilable), satisfy that:
      (not (:description v)) (dissoc :description))))

(defn get-all-channels* [{:keys [logger api-key]} _opts]
  {:post [(check! #'port.chat/get-all-channels %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v2/chatrooms")
                              :method :get
                              :query-params {:auth api-key
                                             :limit "200"}
                              :as :json-keyword-keys})]
    (if-not (<= 200 status 299)
      {:success? false
       :reason :failed-to-get-channels
       :error-details {:result body}}
      {:success? true
       :channels (mapv (fn [channel]
                         (present-channel (cske/transform-keys ->kebab-case channel)))
                       (:data body))})))

(defn get-all-channels-fn [privacy]
  {:pre [(check! port.chat/ChannelPrivacy privacy)]}
  (fn get-all-channels-fn-impl [config _]
    {:post [(check! #'port.chat/get-all-channels %)]}
    (let [{:keys [success?]
           :as result} (get-all-channels* config :_)]
      (if-not success?
        result
        (update result :channels (fn [channels]
                                   (filterv (fn [channel]
                                              {:pre [(check! [:map [:privacy port.chat/ChannelPrivacy]]
                                                             channel)]}
                                              (= (:privacy channel)
                                                 privacy))
                                            channels)))))))

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
                            (present-channel)
                            (assoc :members (update (cske/transform-keys ->kebab-case members)
                                                    :data
                                                    (fn [d]
                                                      (into []
                                                            (comp (map :user)
                                                                  (map #(select-keys % user-info-keys)))
                                                            d))))
                            (assoc :messages (update (cske/transform-keys ->kebab-case messages)
                                                     :messages
                                                     (fn [messages]
                                                       (mapv (fn [{:keys [message created user]}]
                                                               {:message message
                                                                :created created
                                                                ;; We pass :chat-account-id for the service to retrieve users from the DB later.
                                                                ;; Note that this is a sensitive field that is removed from HTTP responses.
                                                                :chat-account-id (:unique-user-identifier user)
                                                                :username (:username user)})
                                                             messages)))))})))))))

(defn get-user-joined-channels* [{:keys [logger api-key] :as chat-adapter} user-id extra-channel-ids]
  {:pre  [(check! port.chat/UniqueUserIdentifier user-id)]
   :post [(check! #'port.chat/get-user-joined-channels %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v2/user/" user-id "/rooms")
                              :method :get
                              :query-params {:auth api-key}
                              :as :json-keyword-keys})]
    (if (<= 200 status 299)
      (let [ch (into []
                     (comp (map #(cske/transform-keys ->kebab-case %))
                           (filter :chat-room) ;; DSC can include memeberships to deleted channels
                           (map (fn [{:keys [role-name]
                                      {:keys [name room-id]} :chat-room}]
                                  {:name name
                                   :id room-id
                                   :role-name role-name})))
                     body)
            valid-ids (into (into #{} (map :id) ch)
                            extra-channel-ids)
            all (when (seq valid-ids)
                  (get-all-channels* chat-adapter :_))]
        (cond
          (empty? valid-ids)
          {:success? true
           :channels []}

          (not (:success? all))
          all

          :else
          {:success? true
           :channels (->> all :channels (filterv (comp valid-ids :id)))}))
      {:success? false
       :reason :failed-to-add-user-to-channel
       :error-details body})))

(defn remove-user-from-channel* [{:keys [logger api-key]} user-id channel-id _]
  {:pre  [(check! port.chat/UniqueUserIdentifier user-id
                  RoomId                         channel-id)]
   :post [(check! #'port.chat/remove-user-from-channel %)]}
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
  {:pre  [(check! port.chat/UniqueUserIdentifier user-id
                  RoomId               channel-id)]
   :post [(check! #'port.chat/add-user-to-public-channel %)]}
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

(def public-permission-level "provisioned_users")

(def private-permission-level "members")

(def custom-css
  (delay
    (slurp (io/resource "ds_chat/custom.css"))))

(defn create-channel* [{:keys [logger api-key]} channel permission-level]
  {:pre [(check! port.chat/NewChannel channel
                 [:enum public-permission-level private-permission-level] permission-level)]}
  (let [req-body (cond-> (dissoc channel :privacy)
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
  {:post [(check! #'port.chat/create-public-channel %)]}
  (create-channel* adapter (assoc channel :privacy port.chat/public) public-permission-level))

(defn create-private-channel* [adapter channel]
  {:post [(check! #'port.chat/create-private-channel %)]}
  (create-channel* adapter (assoc channel :privacy port.chat/private) private-permission-level))

(defn extract-discussion [body]
  (set/rename-keys (select-keys (cske/transform-keys ->kebab-case body)
                                [:id :room-id :notify-all-users :channel-name :enabled])
                   {:room-id :channel-id
                    :channel-name :name}))

(defn create-channel-discussion* [{:keys [logger api-key]} room-id discussion]
  {:pre  [(check! string? room-id
                  port.chat/NewDiscussion discussion)]
   :post [(check! #'port.chat/create-channel-discussion %)]}
  (let [req-body {:enabled true
                  :notifyAllUsers false
                  :channelName (:name discussion)}
        {:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/" room-id "/channel")
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

(defn delete-channel-discussion* [{:keys [logger api-key]} room-id discussion-id]
  {:pre  [(check! :string room-id
                  :string discussion-id)]
   :post [(check! #'port.chat/delete-channel-discussion %)]}
  (timbre/with-context+ {:room-id room-id
                         :discussion-id discussion-id}
    (let [{:keys [status body]}
          (http-client/request logger
                               {:url (build-api-endpoint-url "/api/v1/chatroom/" room-id "/channel/" discussion-id)
                                :query-params {:auth api-key}
                                :method :delete
                                :as :json-keyword-keys})]
      (if (<= 200 status 299)
        (do
          (log logger :info :successfully-deleted-discussion)
          {:success? true})
        (do
          (log logger :warn :failed-to-deleted-discussion)
          {:success? false
           :reason :failed-to-deleted-discussion
           :error-details body})))))

(defn delete-channel* [{:keys [logger api-key]} channel-id]
  {:pre  [(check! RoomId channel-id)]
   :post [(check! #'port.chat/delete-public-channel %)]}
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
    string?]
   [:metadata {:optional true}
    map?]])

(defn set-channel-custom-fields* [{:keys [logger api-key]} channel-id custom-fields]
  {:pre  [(check! RoomId channel-id
                  ChannelUpdates custom-fields)]
   :post [(check! #'port.chat/set-public-channel-custom-fields %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/" channel-id)
                              :method :put
                              :query-params {:auth api-key}
                              :body (cond-> custom-fields
                                      (:metadata custom-fields) (update :metadata json/->json)
                                      true json/->json)
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
   :post [(check! #'port.chat/get-channel-discussions %)]}
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
     `port.chat/create-channel-discussion         create-channel-discussion*
     `port.chat/create-private-channel            create-private-channel*
     `port.chat/create-public-channel             create-public-channel*
     `port.chat/create-user-account               create-user-account*
     `port.chat/delete-channel-discussion         delete-channel-discussion*
     `port.chat/delete-private-channel            delete-channel*
     `port.chat/delete-public-channel             delete-channel*
     `port.chat/delete-user-account               delete-user-account*
     `port.chat/get-channel                       get-channel*
     `port.chat/get-all-channels                  get-all-channels*
     `port.chat/get-private-channels              (get-all-channels-fn "private")
     `port.chat/get-public-channels               (get-all-channels-fn "public")
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
  (let [{:keys [id]} (dev/make-user! (format "a%s@a%s.com" (random-uuid) (random-uuid)))]

    @(def a-user
       ;; exercises port.chat/create-user-account while also persisting the result to the DB:
       (gpml.service.chat/create-user-account (dev/config-component)
                                              id))

    @(def uniqueUserIdentifier (-> a-user :stakeholder :chat-account-id)))

  @(def new-email (format "a%s@a%s.com" (random-uuid) (random-uuid)))

  (port.chat/update-user-account (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                 uniqueUserIdentifier
                                 {:email new-email})

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

  (count (:channels (port.chat/get-public-channels (dev/component :gpml.boundary.adapter.chat/ds-chat) :_)))

  (count (:channels (port.chat/get-private-channels (dev/component :gpml.boundary.adapter.chat/ds-chat) :_)))

  @(def a-private-channel (port.chat/create-private-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                                            {:name (str (random-uuid))}))

  @(def a-public-channel (port.chat/create-public-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                                          {:name (str (random-uuid))}))

  @(def discussion (port.chat/create-channel-discussion (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                                        (-> a-public-channel :channel :id)
                                                        {:name (str (random-uuid))}))

  (port.chat/delete-channel-discussion (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                       (-> a-public-channel :channel :id)
                                       (-> discussion :discussion :id))

  (port.chat/get-channel-discussions (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                     (-> a-public-channel :channel :id))

  (port.chat/set-private-channel-custom-fields (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                               (-> a-public-channel :channel :id)
                                               {:description (str (random-uuid))
                                                :name (str (random-uuid))
                                                :metadata (json/->json {:a 1})})

  (port.chat/add-user-to-public-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                        uniqueUserIdentifier
                                        (-> a-public-channel :channel :id))

  (println (format "https://deadsimplechat.com/%s?uniqueUserIdentifier=%s" (-> a-public-channel :channel :id) uniqueUserIdentifier))

  (port.chat/get-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                         (-> a-public-channel :channel :id))

  (port.chat/add-user-to-private-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                         uniqueUserIdentifier
                                         (-> a-private-channel :channel :id))

  (gpml.service.chat/get-channel-details (dev/config-component)
                                         (-> a-public-channel :channel :id))

  @(def all-chanels (port.chat/get-all-channels (dev/component :gpml.boundary.adapter.chat/ds-chat) {}))

  (port.chat/get-user-joined-channels (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                      uniqueUserIdentifier
                                      [])

  (port.chat/remove-user-from-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                      uniqueUserIdentifier
                                      (-> a-public-channel :channel :id)
                                      {})

  ;; Should be smaller now
  (-> (port.chat/get-user-joined-channels (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                          uniqueUserIdentifier
                                          [])
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
