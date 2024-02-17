(ns gpml.boundary.adapter.chat.rocket-chat.core
  "RocketChat API methods implementation. API methods that has the
  `opts` maps accept (apart from other fields) `:query` and `:fields`
  keys which are maps. `:query` is a MongoDB `query` operator[1] to
  search specific data. `:fields` used to include or exclude fields
  from the response object[2].

  This implementation does conversions in and out of the map
  keys. Reponses' map keys are converted to kebab-case. Method map
  arguments keys are converted to camel case strings to satisfy
  RocketChat API schema. This way the caller can still use the usual
  kebab-case notation when calling the API methods. Keep in mind
  however, that RocketChat model has some special fields that start
  with an underscore such as the `:_id`.

  [1] - https://www.mongodb.com/docs/manual/reference/operator/query/
  [2] - https://developer.rocket.chat/reference/api/rest-api#query-parameters"
  (:require
   [camel-snake-kebab.core :refer [->camelCaseString ->kebab-case]]
   [camel-snake-kebab.extras :as cske]
   [duct.logger :refer [log]]
   [gpml.boundary.port.chat :as port]
   [gpml.util.http-client :as http-client]
   [gpml.util.json :as json]))

(defn- get-auth-headers [api-key api-user-id]
  {"X-Auth-Token" api-key
   "X-User-Id" api-user-id})

(defn- kebab-case->camel-case-string [x]
  (->camelCaseString x :separator \-))

(defn- parse-query-and-fields-opts [{:keys [fields query]}]
  (cond-> {}
    query
    (assoc :query (json/->json (cske/transform-keys kebab-case->camel-case-string query)))

    fields
    (assoc :fields (json/->json (cske/transform-keys kebab-case->camel-case-string fields)))))

(defn- add-channel-avatar-url [api-domain-url {:keys [id] :as channel}]
  (assoc channel :avatar-url (format "%s/avatar/room/%s" api-domain-url id)))

(defn- build-api-endpoint-url [{:keys [api-domain-url api-url-path]} endpoint-url-path]
  (str api-domain-url api-url-path endpoint-url-path))

(defn get-user-info*
  "Gets the RocketChat user information. User joined rooms can also be
  included in the response if `:user-rooms` is set to `1` in the
  `:fields` map in `opts`."
  [{:keys [logger api-key api-user-id] :as adapter} user-id opts]
  (try
    (let [query-params (-> opts
                           (parse-query-and-fields-opts)
                           (assoc :user-id user-id))
          {:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/users.info")
                                   :method :get
                                   :query-params (cske/transform-keys ->camelCaseString query-params)
                                   :content-type :json
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true
         :user (cske/transform-keys ->kebab-case (:user body))}
        {:success? false
         :reason :failed-to-get-user-info
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-get-user-info t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn create-user-account* [{:keys [logger api-key api-user-id] :as adapter} user]
  (try
    (let [{:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/users.create")
                                   :method :post
                                   :body (json/->json (cske/transform-keys ->camelCaseString user))
                                   :content-type :json
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true
         :user (cske/transform-keys ->kebab-case (:user body))}
        {:success? false
         :reason :failed-to-create-user-account
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-create-user-account t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn update-user-account* [{:keys [logger api-key api-user-id] :as adapter} user-id updates]
  (try
    (let [req-body (cske/transform-keys ->camelCaseString {:user-id user-id
                                                           :data updates})
          {:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/users.update")
                                   :method :post
                                   :body (json/->json req-body)
                                   :content-type :json
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true
         :user (cske/transform-keys ->kebab-case (:user body))}
        {:success? false
         :reason :failed-to-update-user-account
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-update-user-account t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn delete-user-account* [{:keys [logger api-key api-user-id] :as adapter} user-id opts]
  (try
    (let [req-body (cond-> {:user-id user-id}
                     (contains? opts :confirm-relinquish)
                     (assoc :confirm-relinquish (:confirm-relinquish opts)))
          {:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/users.delete")
                                   :method :post
                                   :body (json/->json (cske/transform-keys ->camelCaseString req-body))
                                   :content-type :json
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true}
        {:success? false
         :reason :failed-to-delete-user-account
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-delete-user-account t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn set-user-account-active-status*
  "Actives or deactives user account. When `active?` is `false` and
  setting the `opts` `:confirm-relinquish` to `true`, allows user to
  be deactivated even if it is the last owner of a room[1].

  [1] - https://developer.rocket.chat/reference/api/rest-api/endpoints/user-management/users-endpoints/set-users-status-active#payload"
  [{:keys [logger api-key api-user-id] :as adapter} user-id active? opts]
  (try
    (let [req-body (cond-> {:user-id user-id :active-status active?}
                     (contains? opts :confirm-relinquish)
                     (assoc :confirm-relinquish (:confirm-relinquish opts)))
          {:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/users.setActiveStatus")
                                   :method :post
                                   :body (json/->json (cske/transform-keys ->camelCaseString req-body))
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true
         :user (cske/transform-keys ->kebab-case (:user body))}
        {:success? false
         :reason :failed-to-set-user-account-active-status
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-set-user-account-active-status t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- get-public-channel-users [{:keys [logger api-key api-user-id] :as adapter} channel-id opts]
  (try
    (let [query-params (assoc opts :room-id channel-id)
          {:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/channels.members")
                                   :method :get
                                   :query-params (cske/transform-keys ->camelCaseString query-params)
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true
         :users (cske/transform-keys ->kebab-case (:members body))}
        {:success? false
         :reason :failed-to-get-public-channels
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-get-public-channels t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- get-private-channel-users [{:keys [logger api-key api-user-id] :as adapter} channel-id opts]
  (try
    (let [query-params (assoc opts :room-id channel-id)
          {:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/groups.members")
                                   :method :get
                                   :query-params (cske/transform-keys ->camelCaseString query-params)
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true
         :users (cske/transform-keys ->kebab-case (:members body))}
        {:success? false
         :reason :failed-to-get-public-channels
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-get-public-channels t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- add-channel-details [{:keys [logger api-domain-url] :as adapter} channel]
  (let [result (if (= (:t channel) "c")
                 (get-public-channel-users adapter (:id channel) {})
                 (get-private-channel-users adapter (:id channel) {}))]
    (if (:success? result)
      (add-channel-avatar-url api-domain-url (assoc channel :users (:users result)))
      (do
        (log logger :error :failed-to-get-channel-users result)
        (add-channel-avatar-url api-domain-url channel)))))

(defn get-public-channels* [{:keys [logger api-key api-user-id] :as adapter} opts]
  (try
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
                                  {:url (build-api-endpoint-url adapter "/channels.list")
                                   :method :get
                                   :query-params (cske/transform-keys ->camelCaseString query-params)
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true
         :channels (->> (:channels body)
                        (cske/transform-keys ->kebab-case)
                        (map (partial add-channel-details adapter)))}
        {:success? false
         :reason :failed-to-get-public-channels
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-get-public-channels t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn get-private-channels* [{:keys [logger api-key api-user-id] :as adapter} opts]
  (try
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
                                  {:url (build-api-endpoint-url adapter "/groups.listAll")
                                   :method :get
                                   :query-params (cske/transform-keys ->camelCaseString query-params)
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true
         :channels (->> (:groups body)
                        (cske/transform-keys ->kebab-case)
                        (map (partial add-channel-details adapter)))}
        {:success? false
         :reason :failed-to-get-private-channels
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-get-private-channels t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn get-all-channels* [{:keys [logger api-key api-user-id] :as adapter} opts]
  (try
    (let [query-params (cond-> {}
                         (:name opts)
                         (assoc :filter (:name opts))

                         (:types opts)
                         (assoc :types (:types opts)))
          {:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/rooms.adminRooms")
                                   :method :get
                                   :query-params (cske/transform-keys ->camelCaseString query-params)
                                   :headers (get-auth-headers api-key api-user-id)
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
                 :error-details get-public-channels-result}))))))
    (catch Exception t
      (log logger :error :failed-to-get-all-channels t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

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

(defn remove-user-from-channel* [{:keys [logger api-key api-user-id] :as adapter} user-id channel-id channel-type]
  (try
    (let [endpoint (if (= channel-type "c")
                     "/channels.kick"
                     "/groups.kick")
          {:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter endpoint)
                                   :method :post
                                   :body (json/->json {:roomId channel-id :userId user-id})
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true}
        {:success? false
         :reason :failed-to-remove-user-from-channel
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-remove-user-from-channel t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn add-user-to-private-channel* [{:keys [logger api-key api-user-id] :as adapter} user-id channel-id]
  (try
    (let [{:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/groups.invite")
                                   :method :post
                                   :body (json/->json {:roomId channel-id :userId user-id})
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true}
        {:success? false
         :reason :failed-to-add-user-to-private-channel
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-add-user-to-private-channel t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn add-user-to-public-channel* [{:keys [logger api-key api-user-id] :as adapter} user-id channel-id]
  (try
    (let [{:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/channels.invite")
                                   :method :post
                                   :body (json/->json {:roomId channel-id :userId user-id})
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true}
        {:success? false
         :reason :failed-to-add-user-to-public-channel
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-add-user-to-public-channel t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn create-private-channel* [{:keys [logger api-key api-user-id] :as adapter} channel]
  (try
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
                                  {:url (build-api-endpoint-url adapter "/groups.create")
                                   :method :post
                                   :body (json/->json req-body)
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true
         :channel (cske/transform-keys ->kebab-case (:group body))}
        {:success? false
         :reason :failed-to-create-private-channel
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-create-private-channel t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn create-public-channel* [{:keys [logger api-key api-user-id] :as adapter} channel]
  (try
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
                                  {:url (build-api-endpoint-url adapter "/channels.create")
                                   :method :post
                                   :body (json/->json req-body)
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true
         :channel (cske/transform-keys ->kebab-case (:channel body))}
        {:success? false
         :reason :failed-to-create-channel-channel
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-create-channel-channel t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn delete-private-channel* [{:keys [logger api-key api-user-id] :as adapter} channel-id]
  (try
    (let [{:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/groups.delete")
                                   :method :post
                                   :body (json/->json {:roomId channel-id})
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true}
        {:success? false
         :reason :failed-to-delete-private-channel
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-delete-private-channel t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn delete-public-channel* [{:keys [logger api-key api-user-id] :as adapter} channel-id]
  (try
    (let [{:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/channels.delete")
                                   :method :post
                                   :body (json/->json {:roomId channel-id})
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true}
        {:success? false
         :reason :failed-to-delete-public-channel
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-delete-public-channel t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn set-private-channel-custom-fields* [{:keys [logger api-key api-user-id] :as adapter} channel-id custom-fields]
  (try
    (let [req-body (cske/transform-keys
                    ->camelCaseString
                    {:room-id channel-id :custom-fields custom-fields})
          {:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/groups.setCustomFields")
                                   :method :post
                                   :body (json/->json req-body)
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true
         :channel (cske/transform-keys ->kebab-case (:group body))}
        {:success? false
         :reason :failed-to-set-private-channel-custom-fields
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-set-private-channel-custom-fields t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn set-public-channel-custom-fields* [{:keys [logger api-key api-user-id] :as adapter} channel-id custom-fields]
  (try
    (let [req-body (cske/transform-keys
                    ->camelCaseString
                    {:room-id channel-id :custom-fields custom-fields})
          {:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/channels.setCustomFields")
                                   :method :post
                                   :body (json/->json req-body)
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true
         :channel (cske/transform-keys ->kebab-case (:group body))}
        {:success? false
         :reason :failed-to-set-public-channel-custom-fields
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-set-public-channel-custom-fields t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn get-channel-discussions* [{:keys [logger api-key api-user-id] :as adapter} channel-id]
  (try
    (let [{:keys [status body]}
          (http-client/do-request logger
                                  {:url (build-api-endpoint-url adapter "/rooms.getDiscussions")
                                   :method :get
                                   :query-params {:roomId channel-id}
                                   :headers (get-auth-headers api-key api-user-id)
                                   :as :json-keyword-keys})]
      (if (<= 200 status 299)
        {:success? true
         :discussions (cske/transform-keys ->kebab-case (:discussions body))}
        {:success? false
         :reason :failed-to-get-channel-discussions
         :error-details body}))
    (catch Exception t
      (log logger :error :failed-to-get-channel-discussions t)
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn map->RocketChat [m]
  (with-meta m
    {`port/add-user-to-private-channel       add-user-to-private-channel*
     `port/add-user-to-public-channel        add-user-to-public-channel*
     `port/create-private-channel            create-private-channel*
     `port/create-public-channel             create-public-channel*
     `port/create-user-account               create-user-account*
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
