(ns gpml.auth0-util
  (:require [clj-http.client :as client]
            [clojure.walk :as w]
            [jsonista.core :as j]))

(def auth0-token (atom ""))

(def ^:private ^:const default-filters-operator "AND")

(defn- build-filters-query-string
  "Constructs a Lucene like query syntax[1] string. Expects a map of
  filters supported by auth0 users API[2]. Operator is optional and
  defaulted to AND.

  [1] - http://www.lucenetutorial.com/lucene-query-syntax.html
  [2] - https://auth0.com/docs/users/user-search/user-search-query-syntax"
  ([filters] (build-filters-query-string filters default-filters-operator))
  ([filters operator]
   (reduce (fn [acc [filter-key filter-val]]
             (letfn [(vector->str [v]
                       (->> v
                            (interpose " ")
                            (apply str)))
                     (parse-value [v]
                       (if (vector? v)
                         (vector->str v)
                         v))
                     (get-filter-term [filter-key filter-val]
                       (str (name filter-key) ":" (parse-value filter-val)))]
               (if-not (seq acc)
                 (str acc (get-filter-term filter-key filter-val))
                 (str acc " " operator " " (get-filter-term filter-key filter-val)))))
           ""
           filters)))

(defn- parse-response-body [response]
  (->> response
       :body
       j/read-value
       w/keywordize-keys))

(defn fetch-auth0-users
  ([domain] (fetch-auth0-users domain {}))
  ([domain {:keys [filters operator]
            :or {operator default-filters-operator}}]
   (let [url (format "%sapi/v2/users" domain)
         req-opts (merge
                   {:content-type :json
                    :throw-exceptions false
                    :headers {:authorization (format "Bearer %s" @auth0-token)}}
                   (when (seq filters)
                     {:query-params {"q" (build-filters-query-string filters operator)}}))]
     (client/get url req-opts))))

(defn auth0-refresh-token [{:keys [domain client-id secret]}]
  (let [response (client/post (format "%soauth/token" domain)
                              {:content-type "application/x-www-form-urlencoded"
                               :form-params {:grant_type "client_credentials"
                                             :client_id client-id
                                             :client_secret secret
                                             :audience (format "%sapi/v2/" domain)}
                               :throw-exceptions false})]
    ;; FIXME: There's no error handling for the case when this
    ;; fails... We could add a log message, but not sure if we also
    ;; want to show something on the UI? Or alert the devs somehow?

    ;; If we are no longer able to refresh the token (run out of 1000
    ;; tokens/month?), approval of users could be broken until Auth0
    ;; gives us new tokens!!
    (-> response
        :body
        j/read-value
        (get "access_token"))))

(defn maybe-refresh-token-fetch-auth0-users [auth0-config fetch-auth0-users-opts]
  (let [domain (:domain auth0-config)
        data (fetch-auth0-users domain fetch-auth0-users-opts)]
    (if (contains? #{401 400} (:status data))
      (do
        (reset! auth0-token (auth0-refresh-token auth0-config))
        (fetch-auth0-users domain fetch-auth0-users-opts))
      data)))

(defn get-auth0-users-ids
  "Returns a collection of user emails and their corresponding auth0 user_id."
  [auth0-config opts]
  (let [response (maybe-refresh-token-fetch-auth0-users auth0-config opts)]
    (->> (parse-response-body response)
         (map #(select-keys % [:email :user_id])))))

(defn list-auth0-verified-emails [auth0-config]
  (let [opts {:filters {:email_verified true}}
        response (maybe-refresh-token-fetch-auth0-users auth0-config opts)
        verified-emails (->> response
                             :body
                             j/read-value
                             w/keywordize-keys
                             (map :email))]
    verified-emails))

(comment
  (let [auth0-config {:domain (System/getenv "OIDC_ISSUER")
                      :client-id (System/getenv "AUTH0_BACKEND_CLIENT_ID")
                      :secret (System/getenv "AUTH0_BACKEND_SECRET")}]
    (list-auth0-verified-emails auth0-config)))
