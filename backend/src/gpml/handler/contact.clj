(ns gpml.handler.contact
  (:require [duct.logger :refer [log]]
            [gpml.domain.types :as dom.types]
            [gpml.handler.responses :as r]
            [gpml.util :as util]
            [gpml.util.email :as email]
            [integrant.core :as ig]))

(defmethod ig/init-key :gpml.handler.contact/post
  [_ {:keys [contact-settings mailjet-config logger]}]
  (fn [{{:keys [body]} :parameters}]
    (try
      (let [source (:source body)
            dest-email (get-in contact-settings [source :dest-email])]
        (if (seq dest-email)
          (let [{:keys [status reason-phrase]} (email/notify-about-new-contact
                                                mailjet-config
                                                (assoc body :dest-email dest-email))]
            (if (<= 200 status 299)
              (r/ok {:success? true})
              (r/server-error {:success? false
                               :reason :could-not-send-new-contact-email
                               :error-details reason-phrase})))
          (r/server-error {:success? false
                           :reason :could-not-send-new-contact-email
                           :error-details "Destination email address missing in config"})))
      (catch Throwable e
        (log logger :error :failed-to-send-contact-email {:exception-message (ex-message e)
                                                          :exception-class (class e)})
        (r/server-error {:success? false
                         :reason :could-not-send-new-contact-email
                         :error-details {:error (ex-message e)}})))))

(defmethod ig/init-key :gpml.handler.contact/post-params [_ _]
  {:body [:map
          [:email
           {:swagger {:description "Email related to the contact form's sender"
                      :type :string}}
           [:fn {:error/message "It must be a valid email."}
            util/email?]]
          [:name
           {:swagger {:description "Name related to the contact form's sender"
                      :type :string}}
           [:string {:min 1}]]
          [:subject
           {:swagger {:description "Subject of the contact form"
                      :type :string}}
           [:string {:min 1}]]
          [:organization
           {:swagger {:description "Organization related to the contact form"
                      :type :string}}
           [:string {:min 1}]]
          [:message
           {:swagger {:description "Message content for the contact form"
                      :type :string}}
           [:string {:min 1}]]
          [:source
           {:decode/string keyword
            :decode/json keyword
            :swagger {:description "Source platform for the contact form"
                      :type "string"
                      :enum dom.types/resource-source-types}}
           (apply conj [:enum] dom.types/resource-source-types)]]})
