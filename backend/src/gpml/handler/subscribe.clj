(ns gpml.handler.subscribe
  (:require
   [gpml.handler.responses :as r]
   [gpml.util :as util]
   [gpml.util.email :as email]
   [integrant.core :as ig]))

(defmethod ig/init-key :gpml.handler.subscribe/post
  [_ {{:keys [management-dest-email]} :subscribe-settings
      mailjet-config :mailjet-config}]
  (fn [{{:keys [body]} :parameters}]
    (if (seq management-dest-email)
      (let [email (:email body)
            {:keys [status reason-phrase]} (email/notify-secretariat-about-new-subscription-req
                                            mailjet-config
                                            management-dest-email
                                            email)]
        (if (= 200 status)
          (r/ok {:success? true})
          (r/server-error {:success? false
                           :reason :could-not-send-new-subscription-req-email
                           :error-details reason-phrase})))
      (r/bad-request {:success? false
                      :reason :could-not-send-new-subscription-req-email
                      :error-details "Destination email address missing in config"}))))

(defmethod ig/init-key :gpml.handler.subscribe/post-params [_ _]
  {:body [:map
          [:email [:fn {:error/message "It must be a valid email."}
                   util/email?]]]})
