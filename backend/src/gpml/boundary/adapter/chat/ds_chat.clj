(ns gpml.boundary.adapter.chat.ds-chat
  "Dead Simple Chat (deadsimplechat.com) adapter"
  (:require
   [camel-snake-kebab.core :refer [->camelCaseString ->kebab-case]]
   [camel-snake-kebab.extras :as cske]
   [duct.logger :refer [log]]
   [gpml.boundary.port.chat :as port]
   [gpml.util.http-client :as http-client]
   [gpml.util.json :as json]
   [gpml.util.malli :refer [check!]]
   [integrant.core :as ig]
   [clojure.string :as string]
   [gpml.util :refer [url?]]
   [taoensso.timbre :as timbre]))

(defn- kebab-case->camel-case-string [x]
  (->camelCaseString x :separator \-))

(defn- parse-query-and-fields-opts [{:keys [fields query]}]
  (cond-> {}
    query
    (assoc :query (json/->json (cske/transform-keys kebab-case->camel-case-string query)))

    fields
    (assoc :fields (json/->json (cske/transform-keys kebab-case->camel-case-string fields)))))

(defn- build-api-endpoint-url [endpoint-url-path & strs]
  {:pre [(check! [:and :string [:fn (fn starts-with-slash [s]
                                      (string/starts-with? s "/"))]]
                 endpoint-url-path

                 [:maybe [:sequential :string]]
                 strs)]
   :post [(check! url? %)]}
  (apply str "https://api.deadsimplechat.com/consumer" endpoint-url-path strs))

(defn- add-channel-avatar-url [{:keys [id] :as channel}]
  (assoc channel :avatar-url (build-api-endpoint-url" /avatar/room/" id)))

(defn get-user-info*
  "Gets the RocketChat user information. User joined rooms can also be
  included in the response if `:user-rooms` is set to `1` in the
  `:fields` map in `opts`."
  [{:keys [logger api-key] :as adapter} user-id opts]
  (let [query-params (-> opts
                         (parse-query-and-fields-opts)
                         (assoc :user-id user-id))
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/users.info")
                                 :method :get
                                 :query-params {:auth api-key}
                                 ;; :query-params (cske/transform-keys ->camelCaseString query-params)
                                 :content-type :json
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :user (cske/transform-keys ->kebab-case (:user body))}
      {:success? false
       :reason :failed-to-get-user-info
       :error-details body})))


(def NewUser
  [:map {:closed true}
   [:uniqueUserIdentifier {:doc "Must be opaque and complex enough to serve as authentication"} string?]
   [:externalUserId {:doc "Our id - used for easily correlating our User objects to theirs"} string?]
   [:isModerator boolean?]
   [:email string?]
   [:profilePic [:maybe string?]]
   [:username string?]])

(defn new-user-keys []
  (mapv first (subvec NewUser 2 (count NewUser))))

(defn create-user-account* [{:keys [logger api-key] :as adapter} user]
  (let [safe-user (select-keys user (new-user-keys))
        _ (check! NewUser safe-user) ;; unconditional check (no `assert` intended)
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/api/v1/user")
                                 :query-params {:auth api-key}
                                 :method :post
                                 :body (cond-> safe-user
                                         (not (:profilePic user)) (dissoc :profilePic)
                                         true json/->json)
                                 :content-type :json
                                 :as :json-keyword-keys})
        {:keys [access-token] :as obj} (cske/transform-keys ->kebab-case body)]
    ;; XXX persist access-token
    (if (<= 200 status 299)
      {:success? true
       :user (select-keys obj [:username :user-id :is-moderator])}
      {:success? false
       :reason :failed-to-create-user-account
       :error-details body})))

(defn update-user-account* [{:keys [logger api-key] :as adapter} user-id updates]
  (let [req-body (cske/transform-keys ->camelCaseString {:user-id user-id
                                                         :data updates})
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/users.update")
                                 :method :post
                                 :query-params {:auth api-key}
                                 :body (json/->json req-body)
                                 :content-type :json
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :user (cske/transform-keys ->kebab-case (:user body))}
      {:success? false
       :reason :failed-to-update-user-account
       :error-details body})))

(defn delete-user-account* [{:keys [logger api-key] :as adapter} user-id opts]
  (let [req-body (cond-> {:user-id user-id}
                   (contains? opts :confirm-relinquish)
                   (assoc :confirm-relinquish (:confirm-relinquish opts)))
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/users.delete")
                                 :method :post
                                 :query-params {:auth api-key}
                                 :body (json/->json (cske/transform-keys ->camelCaseString req-body))
                                 :content-type :json
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true}
      {:success? false
       :reason :failed-to-delete-user-account
       :error-details body})))

(defn set-user-account-active-status*
  "Actives or deactives user account. When `active?` is `false` and
  setting the `opts` `:confirm-relinquish` to `true`, allows user to
  be deactivated even if it is the last owner of a room[1].

  [1] - https://developer.rocket.chat/reference/api/rest-api/endpoints/user-management/users-endpoints/set-users-status-active#payload"
  [{:keys [logger api-key] :as adapter} user-id active? opts]
  (let [req-body (cond-> {:user-id user-id :active-status active?}
                   (contains? opts :confirm-relinquish)
                   (assoc :confirm-relinquish (:confirm-relinquish opts)))
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/users.setActiveStatus")
                                 :method :post
                                 :query-params {:auth api-key}
                                 :body (json/->json (cske/transform-keys ->camelCaseString req-body))
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :user (cske/transform-keys ->kebab-case (:user body))}
      {:success? false
       :reason :failed-to-set-user-account-active-status
       :error-details body})))

(defn- get-public-channel-users [{:keys [logger api-key] :as adapter} channel-id opts]
  (let [query-params (assoc opts :room-id channel-id)
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/channels.members")
                                 :method :get
                                 :query-params {:auth api-key}
                                 ;; :query-params (cske/transform-keys ->camelCaseString query-params)
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :users (cske/transform-keys ->kebab-case (:members body))}
      {:success? false
       :reason :failed-to-get-public-channels
       :error-details body})))

(defn- get-private-channel-users [{:keys [logger api-key] :as adapter} channel-id opts]
  (let [query-params (assoc opts :room-id channel-id)
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/groups.members")
                                 :method :get
                                 :query-params {:auth api-key}
                                 ;; :query-params (cske/transform-keys ->camelCaseString query-params)
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :users (cske/transform-keys ->kebab-case (:members body))}
      {:success? false
       :reason :failed-to-get-public-channels
       :error-details body})))

(defn- add-channel-details [{:keys [logger] :as adapter} channel]
  (let [result (if (= (:t channel) "c")
                 (get-public-channel-users adapter (:id channel) {})
                 (get-private-channel-users adapter (:id channel) {}))]
    (if (:success? result)
      (-> channel
          (assoc :users (:users result))
          add-channel-avatar-url)
      (do
        (timbre/with-context {:channel channel}
          (log logger :error :failed-to-get-channel-users result))
        (add-channel-avatar-url channel)))))

(defn get-public-channels* [{:keys [logger api-key] :as adapter} opts]
  (let [query-params (parse-query-and-fields-opts
                      (cond-> opts
                        (seq (:query opts))
                        ;; We don't want to get `discussions`
                        ;; threads as public channels. That is why
                        ;; the `prid` filter. It means, filter out
                        ;; all channels that have a primary room id.
                        (update :query (fn [q] {:$and [{:prid {:$exists false}}
                                                       q]}))))
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/channels.list")
                                 :method :get
                                 :query-params {:auth api-key}
                                 ;; :query-params (cske/transform-keys ->camelCaseString query-params)
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :channels (->> (:channels body)
                      (cske/transform-keys ->kebab-case)
                      (map (partial add-channel-details adapter)))}
      {:success? false
       :reason :failed-to-get-public-channels
       :error-details body})))

(defn get-private-channels* [{:keys [logger api-key] :as adapter} opts]
  (let [query-params (parse-query-and-fields-opts
                      (cond-> opts
                        (seq (:query opts))
                        ;; We don't want to get `discussions`
                        ;; threads as public channels. That is why
                        ;; the `prid` filter. It means, filter out
                        ;; all channels that have a primary room id.
                        (update :query (fn [q] {:$and [{:prid {:$exists false}}
                                                       q]}))))
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/groups.listAll")
                                 :method :get
                                 :query-params {:auth api-key}
                                 ;; :query-params (cske/transform-keys ->camelCaseString query-params)
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :channels (->> (:groups body)
                      (cske/transform-keys ->kebab-case)
                      (map (partial add-channel-details adapter)))}
      {:success? false
       :reason :failed-to-get-private-channels
       :error-details body})))

(defn get-all-channels* [{:keys [logger api-key] :as adapter} opts]
  (let [query-params (cond-> {}
                       (:name opts)
                       (assoc :filter (:name opts))

                       (:types opts)
                       (assoc :types (:types opts)))
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/rooms.adminRooms")
                                 :method :get
                                 :query-params {:auth api-key}
                                 ;; :query-params (cske/transform-keys ->camelCaseString query-params)
                                 :as :json-keyword-keys})]
    (if-not (<= 200 status 299)
      {:success? false
       :reason :failed-to-get-all-channels
       :error-details {:result body}}
      (let [channels (:rooms body)
            public-channels-ids (->> channels
                                     (filter #(= (:t %) "c"))
                                     (map :_id))
            private-channels-ids (->> channels
                                      (filter #(= (:t %) "p"))
                                      (map :_id))
            {success? :success?
             private-channels :channels
             :as get-private-channels-result}
            (get-private-channels* adapter
                                   {:query {:_id {:$in private-channels-ids}}})]
        (if-not success?
          {:success? false
           :reason :failed-to-get-user-private-channels
           :error-details get-private-channels-result}
          (let [{success? :success?
                 public-channels :channels
                 :as get-public-channels-result}
                (get-public-channels* adapter
                                      {:query {:_id {:$in public-channels-ids}}})]
            (if success?
              {:success? true
               :channels (into private-channels public-channels)}
              {:success? false
               :reason :failed-to-get-user-public-channels
               :error-details get-public-channels-result})))))))

(defn get-user-joined-channels* [adapter user-id]
  (let [result (port/get-user-info adapter user-id {:fields {:user-rooms 1}})]
    (if-not (:success? result)
      {:success? false
       :reason :failed-to-get-user-information
       :error-details result}
      (let [channels (get-in result [:user :rooms])
            public-channels-ids (->> channels
                                     (filter #(= (:t %) "c"))
                                     (map :rid))
            private-channels-ids (->> channels
                                      (filter #(= (:t %) "p"))
                                      (map :rid))
            {success? :success?
             private-channels :channels
             :as get-private-channels-result}
            (get-private-channels* adapter
                                   {:query {:_id {:$in private-channels-ids}}})]
        (if-not success?
          {:success? false
           :reason :failed-to-get-user-private-channels
           :error-details get-private-channels-result}
          (let [{success? :success?
                 public-channels :channels
                 :as get-public-channels-result}
                (get-public-channels* adapter
                                      {:query {:_id {:$in public-channels-ids}}})]
            (if success?
              {:success? true
               :channels (into private-channels public-channels)}
              {:success? false
               :reason :failed-to-get-user-public-channels
               :error-details get-public-channels-result})))))))

(defn remove-user-from-channel* [{:keys [logger api-key] :as adapter} user-id channel-id channel-type]
  (let [endpoint (if (= channel-type "c")
                   "/channels.kick"
                   "/groups.kick")
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url endpoint)
                                 :method :post
                                 :query-params {:auth api-key}
                                 :body (json/->json {:roomId channel-id :userId user-id})
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true}
      {:success? false
       :reason :failed-to-remove-user-from-channel
       :error-details body})))

(defn add-user-to-private-channel* [{:keys [logger api-key] :as adapter} user-id channel-id]
  (let [{:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url adapter "/groups.invite")
                                 :method :post
                                 :query-params {:auth api-key}
                                 :body (json/->json {:roomId channel-id :userId user-id})
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true}
      {:success? false
       :reason :failed-to-add-user-to-private-channel
       :error-details body})))

(defn add-user-to-public-channel* [{:keys [logger api-key] :as adapter} user-id channel-id]
  (let [{:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/channels.invite")
                                 :method :post
                                 :query-params {:auth api-key}
                                 :body (json/->json {:roomId channel-id :userId user-id})
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true}
      {:success? false
       :reason :failed-to-add-user-to-public-channel
       :error-details body})))

(defn create-private-channel* [{:keys [logger api-key] :as adapter} channel]
  (let [req-body (cske/transform-keys
                  ->camelCaseString
                  ;; We want the admin user calling this endpoint to
                  ;; be added to the newly created
                  ;; channel. Otherwise we don't have necessary
                  ;; permissions to manage it (this is a recurring
                  ;; issue in RocketChat API and there are open
                  ;; issue to fix this).
                  (assoc channel :exclude-self false))
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/groups.create")
                                 :method :post
                                 :query-params {:auth api-key}
                                 :body (json/->json req-body)
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :channel (cske/transform-keys ->kebab-case (:group body))}
      {:success? false
       :reason :failed-to-create-private-channel
       :error-details body})))

(def NewChannel
  [:map {:closed true}
   [:room-id string?]])

(defn create-public-channel* [{:keys [logger api-key] :as adapter} channel]
  {:pre [(check! NewChannel channel)]}
  (let [req-body (cske/transform-keys ->camelCaseString channel)
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/api/v1/chatroom/" ":roodId" "/channel")
                                 :query-params {:auth api-key}
                                 :method :post
                                 :body (json/->json req-body)
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :channel (cske/transform-keys ->kebab-case (:channel body))}
      {:success? false
       :reason :failed-to-create-channel-channel
       :error-details body})))

(defn delete-private-channel* [{:keys [logger api-key] :as adapter} channel-id]
  (let [{:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/groups.delete")
                                 :method :post
                                 :query-params {:auth api-key}
                                 :body (json/->json {:roomId channel-id})
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true}
      {:success? false
       :reason :failed-to-delete-private-channel
       :error-details body})))

(defn delete-public-channel* [{:keys [logger api-key] :as adapter} channel-id]
  (let [{:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/channels.delete")
                                 :method :post
                                 :query-params {:auth api-key}
                                 :body (json/->json {:roomId channel-id})
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true}
      {:success? false
       :reason :failed-to-delete-public-channel
       :error-details body})))

(defn set-private-channel-custom-fields* [{:keys [logger api-key] :as adapter} channel-id custom-fields]
  (let [req-body (cske/transform-keys
                  ->camelCaseString
                  {:room-id channel-id :custom-fields custom-fields})
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/groups.setCustomFields")
                                 :method :post
                                 :query-params {:auth api-key}
                                 :body (json/->json req-body)
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :channel (cske/transform-keys ->kebab-case (:group body))}
      {:success? false
       :reason :failed-to-set-private-channel-custom-fields
       :error-details body})))

(defn set-public-channel-custom-fields* [{:keys [logger api-key] :as adapter} channel-id custom-fields]
  (let [req-body (cske/transform-keys
                  ->camelCaseString
                  {:room-id channel-id :custom-fields custom-fields})
        {:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/channels.setCustomFields")
                                 :method :post
                                 :query-params {:auth api-key}
                                 :body (json/->json req-body)
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :channel (cske/transform-keys ->kebab-case (:group body))}
      {:success? false
       :reason :failed-to-set-public-channel-custom-fields
       :error-details body})))

(defn get-channel-discussions* [{:keys [logger api-key] :as adapter} channel-id]
  (let [{:keys [status body]}
        (http-client/do-request logger
                                {:url (build-api-endpoint-url "/rooms.getDiscussions")
                                 :method :get
                                 :query-params {:auth api-key}
                                 ;; :query-params {:roomId channel-id}
                                 :as :json-keyword-keys})]
    (if (<= 200 status 299)
      {:success? true
       :discussions (cske/transform-keys ->kebab-case (:discussions body))}
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
    {`port/add-user-to-private-channel       add-user-to-private-channel*
     `port/add-user-to-public-channel        add-user-to-public-channel*
     `port/create-private-channel            create-private-channel*
     `port/create-public-channel             create-public-channel* ;; 2.-
     `port/create-user-account               create-user-account* ;; 1.-
     `port/delete-private-channel            delete-private-channel*
     `port/delete-public-channel             delete-public-channel*
     `port/delete-user-account               delete-user-account*
     `port/get-all-channels                  get-all-channels*
     `port/get-channel-discussions           get-channel-discussions*
     `port/get-private-channels              get-private-channels*
     `port/get-public-channels               get-public-channels*
     `port/get-user-info                     get-user-info*
     `port/get-user-joined-channels          get-user-joined-channels*
     `port/remove-user-from-channel          remove-user-from-channel*
     `port/set-private-channel-custom-fields set-private-channel-custom-fields*
     `port/set-public-channel-custom-fields  set-public-channel-custom-fields*
     `port/set-user-account-active-status    set-user-account-active-status*
     `port/update-user-account               update-user-account*}))

(defmethod ig/init-key :gpml.boundary.adapter.chat/ds-chat
  [_ config]
  (map->DSChat config))

(comment
  ;; 1
  (let [{:keys [id email first_name last_name]} (dev/make-user!)]
    (port/create-user-account (dev/component :gpml.boundary.adapter.chat/ds-chat)
                              {:uniqueUserIdentifier (str (random-uuid))
                               :externalUserId (str id)
                               :isModerator false
                               :email email
                               :profilePic nil
                               :username (str first_name " " last_name)}))

  ;; 2
  )
