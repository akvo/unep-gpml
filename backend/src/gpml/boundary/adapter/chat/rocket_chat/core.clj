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

(defn- get-auth-headers
  [api-key api-user-id]
  {"X-Auth-Token" api-key
   "X-User-Id" api-user-id})

(defn- kebab-case->camel-case-string
  [x]
  (->camelCaseString x :separator \-))

(defn- parse-query-and-fields-opts
  [{:keys [fields query]}]
  (cond-> {}
    query
    (assoc :query (json/->json (cske/transform-keys kebab-case->camel-case-string query)))

    fields
    (assoc :fields (json/->json (cske/transform-keys kebab-case->camel-case-string fields)))))

(defn- add-channel-avatar-url
  [api-domain-url {:keys [id] :as channel}]
  (assoc channel :avatar-url (format "%s/avatar/room/%s" api-domain-url id)))

(defn- build-api-endpoint-url
  [{:keys [api-domain-url api-url-path]} endpoint-url-path]
  (str api-domain-url api-url-path endpoint-url-path))

(defn- get-user-info*
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
      (log logger :error :failed-to-get-user-info {:exception-message (ex-message t)
                                                   :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- create-user-account*
  [{:keys [logger api-key api-user-id] :as adapter} user]
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
      (log logger :error :failed-to-create-user-account {:exception-message (ex-message t)
                                                         :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- update-user-account*
  [{:keys [logger api-key api-user-id] :as adapter} user-id updates]
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
      (log logger :error :failed-to-update-user-account {:exception-message (ex-message t)
                                                         :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- delete-user-account*
  [{:keys [logger api-key api-user-id] :as adapter} user-id opts]
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
      (log logger :error :failed-to-delete-user-account {:exception-message (ex-message t)
                                                         :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- set-user-account-active-status*
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
      (log logger :error :failed-to-set-user-account-active-status {:exception-message (ex-message t)
                                                                    :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- get-public-channel-users
  [{:keys [logger api-key api-user-id] :as adapter} channel-id opts]
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
      (log logger :error :failed-to-get-public-channels {:exception-message (ex-message t)
                                                         :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- get-private-channel-users
  [{:keys [logger api-key api-user-id] :as adapter} channel-id opts]
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
      (log logger :error :failed-to-get-public-channels {:exception-message (ex-message t)
                                                         :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- add-channel-details
  [{:keys [logger api-domain-url] :as adapter} channel]
  (let [result (if (= (:t channel) "c")
                 (get-public-channel-users adapter (:id channel) {})
                 (get-private-channel-users adapter (:id channel) {}))]
    (if (:success? result)
      (add-channel-avatar-url api-domain-url (assoc channel :users (:users result)))
      (do
        (log logger :error :failed-to-get-channel-users result)
        (add-channel-avatar-url api-domain-url channel)))))

(defn- get-public-channels*
  [{:keys [logger api-key api-user-id] :as adapter} opts]
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
      (log logger :error :failed-to-get-public-channels {:exception-message (ex-message t)
                                                         :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- get-private-channels*
  [{:keys [logger api-key api-user-id] :as adapter} opts]
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
      (log logger :error :failed-to-get-private-channels {:exception-message (ex-message t)
                                                          :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- get-all-channels*
  [{:keys [logger api-key api-user-id] :as adapter} opts]
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
                 :channels (concat private-channels public-channels)}
                {:success? false
                 :reason :failed-to-get-user-public-channels
                 :error-details get-public-channels-result}))))))
    (catch Exception t
      (log logger :error :failed-to-get-all-channels {:exception-message (ex-message t)
                                                      :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- get-user-joined-channels*
  [adapter user-id]
  (let [result (get-user-info* adapter user-id {:fields {:user-rooms 1}})]
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
               :channels (concat private-channels public-channels)}
              {:success? false
               :reason :failed-to-get-user-public-channels
               :error-details get-public-channels-result})))))))

(defn- remove-user-from-channel*
  [{:keys [logger api-key api-user-id] :as adapter} user-id channel-id channel-type]
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
      (log logger :error :failed-to-remove-user-from-channel {:exception-message (ex-message t)
                                                              :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- add-user-to-private-channel*
  [{:keys [logger api-key api-user-id] :as adapter} user-id channel-id]
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
      (log logger :error :failed-to-add-user-to-private-channel {:exception-message (ex-message t)
                                                                 :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- add-user-to-public-channel*
  [{:keys [logger api-key api-user-id] :as adapter} user-id channel-id]
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
      (log logger :error :failed-to-add-user-to-public-channel {:exception-message (ex-message t)
                                                                :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- create-private-channel*
  [{:keys [logger api-key api-user-id] :as adapter} channel]
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
      (log logger :error :failed-to-create-private-channel {:exception-message (ex-message t)
                                                            :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- create-public-channel*
  [{:keys [logger api-key api-user-id] :as adapter} channel]
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
      (log logger :error :failed-to-create-channel-channel {:exception-message (ex-message t)
                                                            :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- delete-private-channel*
  [{:keys [logger api-key api-user-id] :as adapter} channel-id]
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
      (log logger :error :failed-to-delete-private-channel {:exception-message (ex-message t)
                                                            :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- delete-public-channel*
  [{:keys [logger api-key api-user-id] :as adapter} channel-id]
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
      (log logger :error :failed-to-delete-public-channel {:exception-message (ex-message t)
                                                           :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- set-private-channel-custom-fields*
  [{:keys [logger api-key api-user-id] :as adapter} channel-id custom-fields]
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
      (log logger :error :failed-to-set-private-channel-custom-fields {:exception-message (ex-message t)
                                                                       :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- set-public-channel-custom-fields*
  [{:keys [logger api-key api-user-id] :as adapter} channel-id custom-fields]
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
      (log logger :error :failed-to-set-public-channel-custom-fields {:exception-message (ex-message t)
                                                                      :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn- get-channel-discussions*
  [{:keys [logger api-key api-user-id] :as adapter} channel-id]
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
      (log logger :error :failed-to-get-channel-discussions {:exception-message (ex-message t)
                                                             :stack-trace (map str (.getStackTrace t))})
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defrecord RocketChat [api-domain-url api-url-path api-key api-user-id logger]
  port/Chat
  (create-user-account [this user]
    (create-user-account* this user))
  (update-user-account [this user-id updates]
    (update-user-account* this user-id updates))
  (delete-user-account [this user-id]
    (delete-user-account* this user-id {}))
  (delete-user-account [this user-id opts]
    (delete-user-account* this user-id opts))
  (set-user-account-active-status [this user-id active?]
    (set-user-account-active-status* this user-id active? {}))
  (set-user-account-active-status [this user-id active? opts]
    (set-user-account-active-status* this user-id active? opts))
  (get-public-channels [this opts]
    (get-public-channels* this opts))
  (get-private-channels [this opts]
    (get-private-channels* this opts))
  (get-all-channels [this opts]
    (get-all-channels* this opts))
  (get-user-info [this user-id]
    (get-user-info* this user-id {}))
  (get-user-info [this user-id opts]
    (get-user-info* this user-id opts))
  (get-user-joined-channels [this user-id]
    (get-user-joined-channels* this user-id))
  (remove-user-from-channel [this user-id channel-id channel-type]
    (remove-user-from-channel* this user-id channel-id channel-type))
  (add-user-to-private-channel [this user-id channel-id]
    (add-user-to-private-channel* this user-id channel-id))
  (add-user-to-public-channel [this user-id channel-id]
    (add-user-to-public-channel* this user-id channel-id))
  (create-private-channel [this channel]
    (create-private-channel* this channel))
  (set-private-channel-custom-fields [this channel-id custom-fields]
    (set-private-channel-custom-fields* this channel-id custom-fields))
  (delete-private-channel [this channel-id]
    (delete-private-channel* this channel-id))
  (create-public-channel [this channel]
    (create-public-channel* this channel))
  (set-public-channel-custom-fields [this channel-id custom-fields]
    (set-public-channel-custom-fields* this channel-id custom-fields))
  (delete-public-channel [this channel-id]
    (delete-public-channel* this channel-id))
  (get-channel-discussions [this channel-id]
    (get-channel-discussions* this channel-id)))
