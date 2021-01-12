(ns gpml.handler.policy
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]))

(def policy-sample-data [{:id 1
                          :title "Environment (Protection) Act, 1986 (No. 29 of 1986)"
                          :original_title "The Environment (Protection)Act, 1986"
                          :data_source "FAOLEX"
                          :country "India"
                          :abstract "An Act to provide for the protection and improvement of environment and for matters connected therewith"
                          :type_of_law "Legislation"
                          :record_number "LEX-FAOC021695"
                          :implementing_mea nil
                          :first_publication_date "2015-12-03T00:00:00Z"
                          :latest_amendment_date nil
                          :status "In force"
                          :tags ["product ban"]
                          :geo_coverage_type "national"
                          :geo_coverage_countries ["India"]
                          :urls [{:url "http://extwprlegs1.fao.org/docs/pdf/guy152293.pdf" :language "English"}]
                          :attachments ["http://extwprlegs1.fao.org/docs/pdf/guy152293.pdf"]
                          :remarks "Remarks"
                          :created "2021-01-01T00:00:00Z"
                          :modified "2021-01-01T00:00:00Z"}
                         {:id 2
                          :title "Waste Management Framework Law No.16 of 2020"
                          :original_title nil
                          :data_source "FAOLEX"
                          :country "Jordan"
                          :abstract "Abstract"
                          :type_of_law "Legislation"
                          :record_number "LEX-FAOC193637"
                          :implementing_mea "Basel Convention"
                          :first_publication_date "1998-01-01T00:00:00Z"
                          :latest_amendment_date nil
                          :status "In force"
                          :tags []
                          :geo_coverage_type "national"
                          :geo_coverage_countries ["Jordan"]
                          :urls [{:url "https://www.legislation.gov.au/Details/F2012C00858" :language "English"}]
                          :attachments ["https://www.legislation.gov.au/Details/F2012C00858"]
                          :remarks "Remarks"
                          :created "2021-01-01T00:00:00Z"
                          :modified "2021-01-01T00:00:00Z"}])

(defn policy-sample [_]
  (resp/response {:results policy-sample-data :next nil :prev nil :total 2 :page 1}))

(defmethod ig/init-key :gpml.handler.policy/handler [_ _]
  #'policy-sample)
