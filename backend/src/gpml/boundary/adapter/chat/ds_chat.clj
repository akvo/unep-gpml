(ns gpml.boundary.adapter.chat.ds-chat
  "Dead Simple Chat (deadsimplechat.com) adapter"
  (:require
   [camel-snake-kebab.core :refer [->camelCaseString ->kebab-case]]
   [camel-snake-kebab.extras :as cske]
   [clojure.set :as set]
   [clojure.string :as string]
   [duct.logger :refer [log]]
   [gpml.boundary.port.chat :as port]
   [gpml.util :refer [url?]]
   [gpml.util.http-client :as http-client]
   [gpml.util.json :as json]
   [gpml.util.malli :refer [check!]]
   [integrant.core :as ig]
   [malli.core :as malli]))

;; XXX use cske/transform-keys consistently. note that this ns is used by misc services - not only frontend.

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

(def CreatedUser
  [:map
   [:username string?]
   [:userId string?]
   [:isModerator string?]])

(defn- build-api-endpoint-url [endpoint-url-path & strs]
  {:pre [(check! [:and :string [:fn (fn starts-with-slash [s]
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
  {:pre [(check! UniqueUserIdentifier user-id)]}
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
       :user     body}
      {:success?      false
       :reason        :failed-to-get-user-info
       :error-details body})))

(defn create-user-account* [{:keys [logger api-key]} user]
  {:pre [(check! NewUser user)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/user")
                              :query-params {:auth api-key}
                              :method :post
                              :body (json/->json user)
                              :content-type :json
                              :as :json-keyword-keys})
        obj (cske/transform-keys ->kebab-case body)]
    (if (<= 200 status 299)
      {:success? true
       :user (-> obj
                 (select-keys [:username :user-id :is-moderator :access-token]))}
      {:success? false
       :reason :failed-to-create-user-account
       :error-details body})))

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
  {:pre [(check! DSCInternalId dsc-internal-user-id
                 UserUpdates   updates)]}
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
    (if (<= 200 status 299)
      {:success? true}
      {:success? false
       :reason :failed-to-update-user-account
       :error-details body})))

(defn delete-user-account* [{:keys [logger api-key]} user-id _opts]
  {:pre [(check! UniqueUserIdentifier user-id)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v2/user")
                              :method :delete
                              :query-params {:auth api-key}
                              :body (json/->json {:uniqueUserIdentifier user-id})
                              :content-type :json
                              :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true}
      {:success? false
       :reason :failed-to-delete-user-account
       :error-details body})))

(defn set-user-account-active-status* [{:keys [logger api-key]} user-id active? _opts]
  {:pre [(check! UniqueUserIdentifier user-id
                 boolean? active?)]}
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
    (if (<= 200 status 299)
      {:success? true
       :user body}
      {:success? false
       :reason :failed-to-set-user-account-active-status
       :error-details body})))

(defn get-all-channels* [{:keys [logger api-key]} _opts]
  ;; XXX use :filter, :types opts
  (let [#_#_query-params (cond-> {}
                           (:name opts)
                           (assoc :filter (:name opts))

                           (:types opts)
                           (assoc :types (:types opts)))
        ;; result:
        #_{"passwordProtected" false,
           "enableOneToOneChat" false,
           "moderatorOnlyOneToOneChat" false,
           "enableChannels" false,
           "showNotificationForAllChannels" false,
           "enableLikeMessage" false,
           "defaultNotificationEnabled" false,
           "roomId" "y5KppBwpE",
           "name" "chatroom name",
           "roomPassword" "password",
           "preModeratedChatRoom" false}
        {:keys [status body]}
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

(def Channel
  [:map
   [:showNotificationForAllChannels boolean?]
   [:name string?]
   [:enableLikeMessage boolean?]
   [:roomId string?]
   [:enableOneToOneChat boolean?]
   [:fileSharingMode string?]
   [:passwordProtected boolean?]
   [:defaultNotificationEnabled boolean?]
   [:moderatorOnlyOneToOneChat boolean?]
   [:enableChannels boolean?]])

(defn get-user-joined-channels* [{:keys [logger api-key]} user-id]
  {:pre [(check! UniqueUserIdentifier user-id)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v2/user/" user-id "/rooms")
                              :method :get
                              :query-params {:auth api-key}
                              :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :channels body}
      {:success? false
       :reason :failed-to-add-user-to-channel
       :error-details body})))

(defn remove-user-from-channel* [{:keys [logger api-key]} user-id channel-id _]
  {:pre [(check! UniqueUserIdentifier user-id
                 RoomId channel-id)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v2/room/" channel-id "/member")
                              :method :delete
                              :query-params {:auth api-key}
                              :body (json/->json {:uniqueUserIdentifier user-id})
                              :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true}
      {:success? false
       :reason :failed-to-remove-user-from-channel
       :error-details body})))

(defn add-user-to-channel* [{:keys [logger api-key]} user-id channel-id]
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v2/room/" channel-id "/member")
                              :method :post
                              :query-params {:auth api-key}
                              :body (json/->json {:uniqueUserIdentifier user-id
                                                  ;; https://deadsimplechat.com/developer/platform-guides/new-join-modal-guide/#member-roles
                                                  :roleName "user"})
                              :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true}
      {:success? false
       :reason :failed-to-add-user-to-channel
       :error-details body})))

(def NewChannel
  [:map {:closed true}
   [:name string?]
   [:description {:optional true} [:maybe string?]]])

(def public-permission-level "provisioned_users")

(def private-permission-level "members")

(defn create-channel* [{:keys [logger api-key]} channel permission-level]
  {:pre [(check! NewChannel channel
                 [:fn #{public-permission-level private-permission-level}] permission-level)]}
  (let [req-body (cske/transform-keys ->camelCaseString (cond-> channel
                                                          (:description channel) (assoc :description (:description channel))
                                                          true (assoc :defaultNotificationEnabled "off"
                                                                      :name (:name channel)
                                                                      :fileSharingMode "fileAndImageSharing"
                                                                      :chatRoomPermissionLevel permission-level
                                                                      :enableChannels "on")))
        {:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/")
                              :query-params {:auth api-key}
                              :method :post
                              :body (json/->json req-body)
                              :as :json-keyword-keys})]
    (try
      (if (<= 200 status 299)
        {:success? true
         :channel (set/rename-keys (select-keys (cske/transform-keys ->kebab-case body) [:room-id :url])
                                   {:room-id :id})}
        {:success? false
         :reason :failed-to-create-channel
         :error-details body})
      (catch Exception e
        (log logger :error :f {:body body})
        (throw e)))))

(defn create-public-channel* [adapter channel]
  (create-channel* adapter channel public-permission-level))

(defn create-private-channel* [adapter channel]
  (create-channel* adapter channel private-permission-level))

(def NewDiscussion
  [:map {:closed true}
   [:room-id RoomId]
   [:name string?]])

(defn create-discussion* [{:keys [logger api-key]} discussion]
  {:pre [(check! NewDiscussion discussion)]}
  (let [req-body (cske/transform-keys ->camelCaseString (assoc discussion
                                                               :enabled true
                                                               :notifyAllUsers false
                                                               :channelName (:name discussion)))
        {:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/" (:room-id discussion) "/channel")
                              :query-params {:auth api-key}
                              :method :post
                              :body (json/->json req-body)
                              :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :discussion (cske/transform-keys ->kebab-case (:channel body))}
      {:success? false
       :reason :failed-to-create-discussion
       :error-details body})))

(defn delete-channel* [{:keys [logger api-key]} channel-id]
  {:pre [(check! RoomId channel-id)]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/" channel-id)
                              :method :delete
                              :query-params {:auth api-key}
                              :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true}
      {:success? false
       :reason :failed-to-delete-public-channel
       :error-details body})))

(def ChannelUpdates
  [:map {:closed true}
   [:description {:optional true}
    string?]
   [:name {:optional true}
    string?]])

(defn set-channel-custom-fields* [{:keys [logger api-key]} channel-id custom-fields]
  {:pre [(check! RoomId channel-id
                 ChannelUpdates custom-fields)]}
  (let [{:keys [status body] :as all}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v1/chatroom/" channel-id)
                              :method :put
                              :query-params {:auth api-key}
                              :body (json/->json custom-fields)
                              :as :json-keyword-keys})]
    (try
      (if (<= 200 status 299) ;; XXX this pattern can be improved since status can be :unknown-reason on unexpected exceptions.
        {:success? true
         :channel (select-keys body [:roomId :url])}
        {:success? false
         :reason :failed-to-set-public-channel-custom-fields
         :error-details body})
      (catch Exception _
        all))))

(defn get-channel-discussions* [{:keys [logger api-key]} channel-id]
  {:pre [channel-id]}
  (let [{:keys [status body]}
        (http-client/request logger
                             {:url (build-api-endpoint-url "/api/v2/room/" channel-id "/conversations")
                              :method :get
                              :query-params {:auth api-key}
                              :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :discussions (into []
                          (map (comp #(select-keys % [:conversationId])
                                     #(cske/transform-keys ->kebab-case %)))
                          body)}
      {:success? false
       :reason :failed-to-get-channel-discussions
       :error-details body})))

(defn map->DSChat [m]
  {:pre [(check! [:map
                  [:api-key string?]
                  [:logger some?]]
                 m)]}
  ;; XXX note that arguments like `user` have a new schema - must be updated upstream
  (with-meta m
    {`port/add-user-to-private-channel       add-user-to-channel* ;; 7
     `port/add-user-to-public-channel        add-user-to-channel* ;; 6
     `port/create-private-channel            create-private-channel* ;; 3
     `port/create-public-channel             create-public-channel* ;; 2
     `port/create-user-account               create-user-account* ;; 1
     `port/delete-private-channel            delete-channel* ;; 5
     `port/delete-public-channel             delete-channel* ;; 4
     `port/delete-user-account               delete-user-account* ;; 10
     `port/get-all-channels                  get-all-channels* ;; 8
     `port/get-private-channels              get-all-channels* ;; XXX temp measure - no way to distinguish today
     `port/get-public-channels               get-all-channels* ;; same
     `port/get-channel-discussions           get-channel-discussions*
     `port/get-user-info                     get-user-info* ;; 11
     `port/get-user-joined-channels          get-user-joined-channels* ;; 9
     `port/remove-user-from-channel          remove-user-from-channel* ;; 12
     `port/set-private-channel-custom-fields set-channel-custom-fields* ;; 15
     `port/set-public-channel-custom-fields  set-channel-custom-fields*
     `port/set-user-account-active-status    set-user-account-active-status* ;; 13
     `port/update-user-account               update-user-account* ;; 14
     }))

(defmethod ig/init-key :gpml.boundary.adapter.chat/ds-chat
  [_ config]
  (map->DSChat config))

(comment

  ;; not defined in the protocol - leaving `create-discussion*` just in case
  (create-discussion* (dev/component :gpml.boundary.adapter.chat/ds-chat)
                      {:room-id "8BSYDSjgT"
                       :channel-name (str (random-uuid))})

  ;; 1
  (let [{:keys [id email first_name last_name chat_account_id]} (dev/make-user! "vemv@vemv.net")]

    @(def uniqueUserIdentifier (doto chat_account_id assert))

    @(def a-user (port/create-user-account (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                           {:uniqueUserIdentifier uniqueUserIdentifier
                                            :externalUserId (str id)
                                            :isModerator false
                                            :email email
                                            :username (str first_name " " last_name)})))

  ;; 14
  (port/update-user-account (dev/component :gpml.boundary.adapter.chat/ds-chat)
                            (-> a-user :user :user-id)
                            {:email (format "a%s@a%s.com" (random-uuid) (random-uuid))})

  ;; 11
  (port/get-user-info (dev/component :gpml.boundary.adapter.chat/ds-chat)
                      uniqueUserIdentifier
                      {})

  ;; 13
  (port/set-user-account-active-status (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                       uniqueUserIdentifier
                                       false
                                       {})

  ;; 13
  (port/set-user-account-active-status (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                       uniqueUserIdentifier
                                       true
                                       {})

  ;; 2
  ;; DS chat rooms are like RC channels
  ;; DS channels are like RC discussions
  @(def a-public-channel (port/create-public-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                                     {:name (str (random-uuid))
                                                      :description nil}))

  ;; 3
  @(def a-private-channel (port/create-private-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                                       {:name (str (random-uuid))
                                                        :description nil}))

  ;; 15
  (port/set-private-channel-custom-fields (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                          (-> a-public-channel :channel :room-id)
                                          {:description (str (random-uuid))
                                           :name (str (random-uuid))})

  ;; 6
  (port/add-user-to-public-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                   uniqueUserIdentifier
                                   (-> a-public-channel :channel :room-id))

  ;; 7
  (port/add-user-to-private-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                    uniqueUserIdentifier
                                    (-> a-private-channel :channel :room-id))

  ;; 8
  @(def all-chanels (port/get-all-channels (dev/component :gpml.boundary.adapter.chat/ds-chat) {}))

  ;; 9
  (port/get-user-joined-channels (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                 uniqueUserIdentifier)

  ;; 12
  (port/remove-user-from-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                 uniqueUserIdentifier
                                 (-> a-public-channel :channel :room-id)
                                 {})

  ;; Should be smaller now
  (-> (port/get-user-joined-channels (dev/component :gpml.boundary.adapter.chat/ds-chat)
                                     uniqueUserIdentifier)
      :channels
      count)

  ;; 10
  (port/delete-user-account (dev/component :gpml.boundary.adapter.chat/ds-chat)
                            uniqueUserIdentifier
                            {})

  ;; 4
  (port/delete-public-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                              (-> a-public-channel :channel :room-id))

  ;; 5
  (port/delete-private-channel (dev/component :gpml.boundary.adapter.chat/ds-chat)
                               (-> a-private-channel :channel :room-id)))
