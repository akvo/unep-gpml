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
   [gpml.util.malli :refer [PresentString check!]]
   [gpml.util.result :refer [failure]]
   [gpml.util.thread-transactions :refer [saga]]
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
   :profile-pic
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
          (failure {:reason :failed-to-create-user-account
                    :error-details body
                    :status status}))))))

(def RoomId PresentString)

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
    :boolean]
   [:email {:optional true}
    :string]
   [:profilePic {:optional true}
    :string]
   [:meta {:optional true}
    :string]
   [:username {:optional true}
    :string]])

(defn update-user-account* [{:keys [logger api-key] :as this} unique-user-identifier updates]
  {:pre  [(check! port.chat/UniqueUserIdentifier unique-user-identifier
                  UserUpdates                    updates)]
   :post [(check! #'port.chat/update-user-account %)]}
  (saga logger {:success? true}
    ;; Retrieve values to use as defaults because as of today, this API needs all attributes to be present - else they'll be nulled out
    (fn get-user [context]
      (let [result (get-user-info* this unique-user-identifier :_)]
        (if (:success? result)
          (assoc context :user (:user result))
          result)))

    (fn effect-changes [context]
      (let [{:keys [external-user-id
                    is-moderator
                    email
                    profile-pic
                    meta
                    username]}
            (-> context :user (select-keys user-info-keys))

            {:keys [status body]}
            (http-client/request logger
                                 {:url (build-api-endpoint-url "/api/v1/user")
                                  :method :put
                                  :query-params {:auth api-key}
                                  :body (json/->json (merge (when meta
                                                              {:meta meta})
                                                            (when profile-pic
                                                              {:profilePic profile-pic})
                                                            {:uniqueUserIdentifier unique-user-identifier
                                                             :externalUserId external-user-id
                                                             :isModerator (boolean is-moderator)
                                                             :email email
                                                             :username username}
                                                            updates))
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
              (failure {:reason :failed-to-update-user-account
                        :error-details body
                        :status status}))))))))

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
          (failure {:reason :failed-to-delete-user-account
                    :error-details body
                    :status status}))))))

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
          (failure {:reason :failed-to-set-user-account-active-status
                    :error-details body
                    :status status}))))))

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
      ;; :description/:metadata are both optional and nilable for DSC. Our schema is stronger (optional, non-nilable), satisfy that:
      (not (:metadata v)) (dissoc :metadata)
      (not (:description v)) (dissoc :description))))

(defn get-all-channels* [{:keys [logger api-key profile]} _opts]
  {:pre [(check! keyword? profile)]
   :post [(check! #'port.chat/get-all-channels %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v2/chatrooms")
                              :method :get
                              :query-params {:auth api-key
                                             :limit "200"}
                              :as :json-keyword-keys})]
    (if-not (<= 200 status 299)
      (failure {:reason :failed-to-get-channels
                :error-details {:result body}
                :status status})
      {:success? true
       :channels (into []
                       (comp (map (fn [channel]
                                    (present-channel (cske/transform-keys ->kebab-case channel))))
                             (filter (fn [channel]
                                       (= (name profile)
                                          (some-> channel :metadata :environment)))))
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

(defn present-messages [messages & {:keys [discussion-id conversation-id]}]
  (mapv (fn [{:keys [message messages created user]}]
          (let [msg (or message messages)]
            (cond-> {:message msg
                     :created created
                   ;; We pass :chat-account-id for the service to retrieve users from the DB later.
                   ;; Note that this is a sensitive field that is removed from HTTP responses.
                     :chat-account-id (:unique-user-identifier user)
                     :username (:username user)
                     :chat-user-id (:id user)
                     :unique-user-identifier (:unique-user-identifier user)}
              discussion-id (assoc :discussion-id discussion-id)
              conversation-id (assoc :conversation-id conversation-id))))
        messages))

(defn get-discussion-messages* [{:keys [logger api-key]} channel-id discussion-id]
  {:pre  [channel-id discussion-id]
   :post [(check! #'port.chat/get-discussion-messages %)]}
  (let [{:keys [status body]
         {:keys [messages]} :body}
        ;; https://deadsimplechat.com/developer/rest-api/get-channel-messages
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/" channel-id "/channel/" discussion-id "/messages")
                              :method :get
                              :query-params {:auth api-key}
                              :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :messages (present-messages (cske/transform-keys ->kebab-case messages)
                                   :discussion-id discussion-id)}
      (failure {:reason :failed-to-get-channel-discussions
                :error-details body
                :status status}))))

(defn extract-discussion [body]
  (set/rename-keys (select-keys (cske/transform-keys ->kebab-case body)
                                [:id :room-id :notify-all-users :channel-name :enabled])
                   {:room-id :channel-id
                    :channel-name :name}))

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
      (failure {:reason :failed-to-get-channel-discussions
                :error-details body
                :status status}))))

(defn get-channel-conversations* [{:keys [logger api-key]} channel-id]
  {:pre  [channel-id]
   :post [(check! #'port.chat/get-channel-conversations %)]}
  (let [{:keys [status body]}
        (http-client/request logger {:url (build-api-endpoint-url "/api/v2/room/" channel-id "/conversations")
                                     :method :get
                                     :query-params {:auth api-key}
                                     :as :json-keyword-keys})
        member-keys [:id :email :username :unique-user-identifier]]
    (if (<= 200 status 299)
      (let [conversations (mapv (fn [conversation]
                                  (-> conversation
                                      (set/rename-keys {:room-id :channel-id})
                                      (update :member-one #(select-keys % member-keys))
                                      (update :member-two #(select-keys % member-keys))))
                                (cske/transform-keys ->kebab-case body))]
        {:success? true
         :conversations conversations})
      (failure {:reason :failed-to-get-channel-conversations
                :error-detail body
                :status status}))))

(defn get-conversation-messages [{:keys [logger api-key]} channel-id conversation-id]
  (let [{:keys [status] messages :body}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v2/room/" channel-id "/conversation/" conversation-id "/messages")
                              :method :get
                              :query-params {:auth api-key}
                              :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :messages (present-messages (cske/transform-keys ->kebab-case messages) :conversation-id conversation-id)}
      (failure {:reason :failed-to-get-channel-conversations
                :error-details {:result messages}
                :status status}))))

(defn get-conversations-with-messages [{:keys [logger] :as this} channel-id]
  (let [conversations-response (get-channel-conversations* this channel-id)]
    (if-not (:success? conversations-response)
      (do
        (log logger :error conversations-response)
        [])
      (let [conversations (or (:conversations conversations-response) [])]
        (reduce
         (fn [acc conversation]
           (let [conversation-id (:conversation-id conversation)]
             (if-not conversation-id
               (do
                 (log logger :error {:channel-id channel-id :conversation conversation})
                 acc)
               (let [messages-response (get-conversation-messages this channel-id conversation-id)]
                 (if-not (:success? messages-response)
                   (do
                     (log logger :error messages-response)
                     (conj acc (assoc conversation :messages [])))
                   (conj acc (assoc conversation :messages (:messages messages-response))))))))
         []
         conversations)))))

(defn get-discussions-with-messages [{:keys [logger] :as this} channel-id]
  (let [discussions-response (get-channel-discussions* this channel-id)]
    (if-not (:success? discussions-response)
      (do
        (log logger :error discussions-response)
        [])
      (let [discussions (or (:discussions discussions-response) [])]
        (reduce
         (fn [acc discussion]
           (let [discussion-id (:id discussion)]
             (if-not discussion-id
               (do
                 (log logger :error {:channel-id channel-id :discussion discussion})
                 acc)
               (let [messages-response (get-discussion-messages* this channel-id discussion-id)]
                 (if-not (:success? messages-response)
                   (do
                     (log logger :error messages-response)
                     (conj acc (assoc discussion :messages [])))
                   (conj acc (assoc discussion :messages (:messages messages-response))))))))
         []
         discussions)))))

(defn get-channel-details [{:keys [logger api-key]} channel-id]
  (let [{:keys [status body]}
        (http-client/request logger {:url (build-api-endpoint-url "/api/v1/chatroom/" channel-id)
                                     :method :get
                                     :query-params {:auth api-key}
                                     :as :json-keyword-keys})]
    (if-not (<= 200 status 299)
      (failure {:reason :failed-to-get-channel :error-details {:result body} :status status})
      (let [channel-base (cske/transform-keys ->kebab-case body)
            {:keys [status body]}
            (http-client/request logger {:url (build-api-endpoint-url "/api/v2/room/" channel-id "/members")
                                         :method :get
                                         :query-params {:auth api-key :limit "200"}
                                         :as :json-keyword-keys})]
        (if-not (<= 200 status 299)
          (failure {:reason :failed-to-get-members :error-details {:result body} :status status})
          (let [members (cske/transform-keys ->kebab-case body)
                {:keys [status body]}
                (http-client/request logger {:url (build-api-endpoint-url "/api/v1/chatRoom/" channel-id "/messages")
                                             :method :get
                                             :query-params {:auth api-key :limit "20"}
                                             :as :json-keyword-keys})]
            (if-not (<= 200 status 299)
              (failure {:reason :failed-to-get-messages :error-details {:result body} :status status})
              (let [messages (cske/transform-keys ->kebab-case body)]
                {:success? true
                 :channel (-> channel-base
                              (present-channel)
                              (assoc :members (update members
                                                      :data
                                                      (fn [d] (into []
                                                                    (comp (map :user)
                                                                          (map #(select-keys % user-info-keys)))
                                                                    d))))
                              (assoc :messages (update messages :messages present-messages)))}))))))))

(defn get-channel* [this channel-id include-discussion-messages?]
  {:pre  [(check! RoomId channel-id)]
   :post [(check! #'port.chat/get-channel %)]}
  (let [details-response (get-channel-details this channel-id)]
    (if-not (:success? details-response)
      details-response ; Propagate failure from fetching channel details
      (let [result (-> details-response
                       :channel
                       (assoc :discussions [])
                       (assoc :conversations []))]
        (if include-discussion-messages?
          (let [discussions   (get-discussions-with-messages this channel-id)
                conversations (get-conversations-with-messages this channel-id)]
            {:success? true
             :channel   (-> result
                            (assoc :discussions discussions)
                            (assoc :conversations conversations))})
          {:success? true :channel result})))))

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
           :channels (into []
                           (filter (comp valid-ids :id))
                           (:channels all))}))
      (failure {:reason :failed-to-add-user-to-channel
                :error-details body
                :status status}))))

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
          (failure {:reason :failed-to-remove-user-from-channel
                    :error-details body
                    :status status}))))))

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
          (failure {:reason :failed-to-add-user-to-channel
                    :error-details body
                    :status status}))))))

(def public-permission-level "provisioned_users")

(def private-permission-level "members")

(def custom-css
  (delay
    (slurp (io/resource "ds_chat/custom.css"))))

(defn create-channel* [{:keys [logger api-key profile]} channel permission-level]
  {:pre [(check! :keyword profile
                 port.chat/NewChannel channel
                 [:enum public-permission-level private-permission-level] permission-level)]}
  (let [req-body (cond-> (dissoc channel :privacy)
                   (:description channel) (assoc :description (:description channel))
                   true (assoc :defaultNotificationEnabled "off"
                               :metadata (json/->json {:environment (name profile)})
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
          (failure {:reason :failed-to-create-channel
                    :error-details body
                    :status status}))))))

(defn create-public-channel* [adapter channel]
  {:post [(check! #'port.chat/create-public-channel %)]}
  (create-channel* adapter (assoc channel :privacy port.chat/public) public-permission-level))

(defn create-private-channel* [adapter channel]
  {:post [(check! #'port.chat/create-private-channel %)]}
  (create-channel* adapter (assoc channel :privacy port.chat/private) private-permission-level))

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
          (failure {:reason :failed-to-create-discussion
                    :error-details body
                    :status status}))))))

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
          (failure {:reason :failed-to-deleted-discussion
                    :error-details body
                    :status status}))))))

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
          (failure {:reason :failed-to-delete-public-channel
                    :error-details body
                    :status status}))))))

(def ChannelUpdates
  [:map {:closed true}
   [:description {:optional true}
    string?]
   [:name {:optional true}
    string?]
   [:metadata {:optional true}
    map?]])

(defn set-channel-custom-fields* [{:keys [logger api-key] :as config} channel-id custom-fields]
  {:pre  [(check! RoomId channel-id
                  ChannelUpdates custom-fields)]
   :post [(check! #'port.chat/set-public-channel-custom-fields %)]}
  (saga logger {:success? true}

    (fn get-channel [_context]
      ;; Get the channel so that we can preserve its metadata
      ;; (most critically, its :environment)
      (get-channel* config channel-id false))

    (fn do-set-custom-fields [context]
      (let [existing-metadata (-> context :channel :metadata)
            {:keys [status body]}
            (http-client/request logger
                                 {:url (build-api-endpoint-url "/api/v1/chatroom/" channel-id)
                                  :method :put
                                  :query-params {:auth api-key}
                                  :body (cond-> custom-fields
                                          (and (:metadata custom-fields)
                                               existing-metadata)   (update :metadata (fn [v]
                                                                                        (merge existing-metadata
                                                                                               ;; the new one takes priority.
                                                                                               v)))
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
              (failure {:reason :failed-to-set-public-channel-custom-fields
                        :error-details body
                        :status status}))))))))

(defn get-channel-present-users* [{:keys [logger api-key]} channel-id]
  {:pre  [channel-id]
   :post [(check! #'port.chat/get-channel-present-users %)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/" channel-id "/presence")
                              :method :get
                              :query-params {:auth api-key}
                              :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :user-ids (->> body :data (mapv :_id))}
      (failure {:reason :failed-to-get-channel-present-users
                :error-details body
                :status status}))))

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
     `port.chat/get-all-channels                  get-all-channels*
     `port.chat/get-channel                       get-channel*
     `port.chat/get-private-channels              (get-all-channels-fn "private")
     `port.chat/get-public-channels               (get-all-channels-fn "public")
     `port.chat/get-channel-discussions           get-channel-discussions*
     `port.chat/get-channel-conversations         get-channel-conversations*
     `port.chat/get-discussion-messages           get-discussion-messages*
     `port.chat/get-channel-present-users         get-channel-present-users*
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
  ;;
  (let [{:keys [id]} (dev/make-user! (format "a%s@a%s.com" (random-uuid) (random-uuid)))]

    @(def a-user
       ;; exercises port.chat/create-user-account while also persisting the result to the DB:
       (gpml.service.chat/create-user-account (dev/config-component)
                                              id))

    @(def uniqueUserIdentifier (-> a-user :stakeholder :chat-account-id)))

  @(def new-email (format "a%s@a%s.com" (random-uuid) (random-uuid)))

  (port.chat/update-user-account (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                 uniqueUserIdentifier
                                 {:email new-email
                                  :profilePic "https://avatars.githubusercontent.com/u/1162994?v=4"})

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

  ;;
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
                                                :metadata {:a 1}})

  (port.chat/add-user-to-public-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                        uniqueUserIdentifier
                                        (-> a-public-channel :channel :id))
  ;; OR
  ;;
  (gpml.service.chat/join-channel (dev/config-component)
                                  (-> a-public-channel :channel :id)
                                  (:stakeholder a-user))

  ;;
  (println (format "https://deadsimplechat.com/%s?uniqueUserIdentifier=%s" (-> a-public-channel :channel :id) uniqueUserIdentifier))

  (port.chat/get-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                         (-> a-public-channel :channel :id)
                         false)

  ;;
  (port.chat/get-channel-present-users (dev/component :gpml.boundary.adapter.chat/ds-chat)
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

  (doseq [{:keys [id]} (->> (port.chat/get-all-channels (dev/component :gpml.boundary.adapter.chat/ds-chat) {})
                            :channels
                            (filter (fn [{:keys [name]}]
                                      (or (parse-uuid name)
                                          (parse-uuid (subs name 3))))))]
    (port.chat/delete-public-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                     id)))
