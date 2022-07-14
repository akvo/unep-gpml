(ns gpml.util.auth0
  (:require [clj-http.client :as client]
            [clojure.walk :as w]
            [jsonista.core :as j]))

(def auth0-token (atom ""))

(defn- parse-response-body [response]
  (->> response
       :body
       j/read-value
       w/keywordize-keys))

(defn fetch-auth0-users
  [domain]
  (client/get (format "%sapi/v2/users" domain)
              {:content-type :json
               :throw-exceptions false
               :headers {:authorization (format "Bearer %s" @auth0-token)}}))

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

(defn maybe-refresh-token-fetch-auth0-users [auth0-config]
  (let [domain (:domain auth0-config)
        data (fetch-auth0-users domain)]
    (if (contains? #{401 400} (:status data))
      (do
        (reset! auth0-token (auth0-refresh-token auth0-config))
        (fetch-auth0-users domain))
      data)))

(defn list-auth0-verified-emails [auth0-config]
  (let [response (maybe-refresh-token-fetch-auth0-users auth0-config)
        verified-emails (->> (parse-response-body response)
                             (filter :email_verified)
                             (map :email))]
    verified-emails))

(comment
  (let [auth0-config {:domain (System/getenv "OIDC_ISSUER")
                      :client-id (System/getenv "AUTH0_BACKEND_CLIENT_ID")
                      :secret (System/getenv "AUTH0_BACKEND_SECRET")}]
    (list-auth0-verified-emails auth0-config)))
