(ns gpml.util.email-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [gpml.util.email :as sut]
   [postal.message :as postal.message])
  (:import
   (javax.mail.internet InternetAddress)))

;; These cover the translation layer between our message shape and
;; postal's, which is where the SMTP migration can go wrong quietly:
;; a mis-parsed recipient or a dropped timeout both look like working
;; code until mail lands somewhere unexpected or a thread hangs.

(def sender {:Name "GlobalPlasticsHub" :Email "no-reply@gpmarinelitter.org"})

(deftest make-message-builds-a-multipart-alternative
  (let [{:keys [body] :as message} (sut/make-message sender
                                                     {:Name "Jane Doe" :Email "jane@example.com"}
                                                     "Subject"
                                                     "plain text"
                                                     "<p>html</p>")
        [multipart-type text html] body]
    (is (= :alternative multipart-type))
    (is (= {:type "text/plain; charset=utf-8" :content "plain text"} text))
    (is (= {:type "text/html; charset=utf-8" :content "<p>html</p>"} html))
    (is (= "Subject" (:subject message)))))

(deftest make-message-keeps-a-comma-in-a-display-name-from-splitting-the-recipient
  ;; Display names come from user-supplied profile fields. Written as
  ;; "Smith, John <john@example.com>" and handed to postal as a string,
  ;; this parses as two addresses and the mail goes to a bogus one.
  (let [message (sut/make-message sender
                                  {:Name "Smith, John" :Email "john@example.com"}
                                  "Subject"
                                  "plain text"
                                  "<p>html</p>")
        ^InternetAddress to (:to message)]
    (is (= "john@example.com" (.getAddress to)))
    (is (= "Smith, John" (.getPersonal to)))
    (is (= 1 (count (postal.message/recipients message)))
        "postal must still see exactly one recipient")))

(deftest smtp-server-translates-our-config-into-postals
  (let [smtp-server #'sut/smtp-server]
    (testing "blank credentials become nil, so postal leaves mail.smtp.auth off"
      (let [server (smtp-server {:host "localhost" :port 587 :user "" :pass "" :tls true :ssl false :timeout 10000})]
        (is (nil? (:user server)))
        (is (nil? (:pass server)))))

    (testing "timeouts are strings, since jakarta.mail ignores numeric property values"
      (let [server (smtp-server {:host "localhost" :port 587 :user nil :pass nil
                                 :tls true :ssl false :timeout 10000})]
        (is (= "10000" (:connectiontimeout server)))
        (is (= "10000" (:timeout server)))
        (is (= "10000" (:writetimeout server)))))))
