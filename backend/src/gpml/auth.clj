(ns gpml.auth
  (:require [integrant.core :as ig]
            [malli.core :as malli])
  (:import [com.auth0.jwk JwkProvider JwkProviderBuilder]
           [com.auth0.jwt JWT]
           [com.auth0.jwt.impl JsonNodeClaim]
           [com.auth0.utils.tokens SignatureVerifier PublicKeyProvider IdTokenVerifier]))

(set! *warn-on-reflection* true)

(def verifier-opts
  [:map
   [:issuer [:re #"^https://\S+/$"]]
   [:audience [:re #"^\S+$" ]]])

(defn validate-opts
  [opts]
  (or (malli/validate verifier-opts opts)
      (throw
       (ex-info "Invalid IdToken verifier options"
                (malli/explain verifier-opts opts)))))

(defmethod ig/prep-key :gpml.auth/id-token-verifier [_ opts]
  (fn []
    (validate-opts opts)
    opts))

(defmethod ig/init-key :gpml.auth/id-token-verifier [_ opts]
  (fn []
    (let [jwk-provider (-> (:issuer opts)
                           (JwkProviderBuilder.)
                           (.build))
          public-key-provider (reify PublicKeyProvider
                                (getPublicKeyById [this key-id]
                                  (.getPublicKey (.get ^JwkProvider jwk-provider key-id))))
          signature-verifier (SignatureVerifier/forRS256 public-key-provider)]
      (.build
       (IdTokenVerifier/init (:issuer opts)
                             (:audience opts)
                             signature-verifier)))))


(comment

  (validate-opts {:issuer "https://foo.com/"
                  :audience "aslkdasjdlakd"})
;; => true

  (def provider (-> "https://unep-gpml-test.eu.auth0.com/"
                    (JwkProviderBuilder.)
                    (.build)))

  (def public-key-provider (reify PublicKeyProvider
                             (getPublicKeyById [this key-id]
                               (.getPublicKey (.get ^JwkProvider provider key-id)))))

  (def signature-verifier (SignatureVerifier/forRS256 public-key-provider))

  (def id-token-verifier (.build
                          (IdTokenVerifier/init "https://unep-gpml-test.eu.auth0.com/"
                                                "dxfYNPO4D9ovQr5NHFkOU3jwJzXhcq5J"
                                                signature-verifier)))

  (def token "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InhnZ0lPLTJ2LWZqbWljV1VXMjRiNSJ9.eyJuaWNrbmFtZSI6Iml2YW4rOTkiLCJuYW1lIjoiaXZhbis5OUBha3ZvLm9yZyIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci8xNGIxYjRkYzEwZDc0MTA5ODJmZjM5NzcyMmI4MjRkND9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRml2LnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIxLTAxLTE1VDE0OjI1OjE4LjUxN1oiLCJlbWFpbCI6Iml2YW4rOTlAYWt2by5vcmciLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vdW5lcC1ncG1sLXRlc3QuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYwMDFhNWNlNGJmZTk4MDA2ODZhZTAyZSIsImF1ZCI6ImR4ZllOUE80RDlvdlFyNU5IRmtPVTNqd0p6WGhjcTVKIiwiaWF0IjoxNjEwODQ1NzUzLCJleHAiOjE2MTA4ODE3NTMsIm5vbmNlIjoiWTFGTGMyRktabkJEVUVwWlltaFRRVVl5UXpoT1FtWm9UbU5KZGxobFQyNUxUV1pUZm1oa1JFcFFiUT09In0.0teh1UkJZVpAfgMFXm14falzWQRR-BRZdamF2xgfYcOROG8WWzT_qUL1bH_MAg433oSedGrdpnG6UhVgeZbwuzRtWpb2ANdp5UTa3K6UeV7OzNptGh2Mqr52CIUirXbrIwjF2bnZbMZW4YzkxWDwNBiFateIsxcQL8-H0nuyrUztvbICNfffhcmF9XG6tEsSs0HDR0Ilk54d70EXaXnwjuVqpGU5ieUtCv9GatU692fmTNPvAvlhuMrnCLDAJl0nXl4PU1RirKL8zh2YUNSPrTx89V7_HpOarlK8OJvP-ZuwVjDQfmWbi7Rc4ARvy6jX_ALmzt98vZiX53sPJ3b7Iw")



  (try
    (.verify ^IdTokenVerifier id-token-verifier token)
    (catch Exception e
      (.getMessage e)))

  (def claims
    (->
     (JWT/decode token)
     (.getClaims)))

  (reduce-kv (fn [m ^String k ^JsonNodeClaim v]
               (assoc m k (case k
                            "email_verified" (.asBoolean v)
                            "iat" (.asDate v)
                            "exp" (.asDate v)
                            (.asString v)))) {} (into {} claims))
;; => {"email_verified" false,
;;     "iat" #inst "2021-01-17T01:09:13.000-00:00",
;;     "nickname" "ivan+99",
;;     "aud" "dxfYNPO4D9ovQr5NHFkOU3jwJzXhcq5J",
;;     "sub" "auth0|6001a5ce4bfe9800686ae02e",
;;     "iss" "https://unep-gpml-test.eu.auth0.com/",
;;     "email" "ivan+99@akvo.org",
;;     "name" "ivan+99@akvo.org",
;;     "updated_at" "2021-01-15T14:25:18.517Z",
;;     "exp" #inst "2021-01-17T11:09:13.000-00:00",
;;     "picture"
;;     "https://s.gravatar.com/avatar/14b1b4dc10d7410982ff397722b824d4?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fiv.png",
;;     "nonce" "Y1FLc2FKZnBDUEpZYmhTQUYyQzhOQmZoTmNJdlhlT25LTWZTfmhkREpQbQ=="}

  ,)
