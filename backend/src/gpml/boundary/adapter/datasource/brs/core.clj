(ns gpml.boundary.adapter.datasource.brs.core
  (:require [duct.logger :refer [log]]
            [gpml.boundary.adapter.datasource.brs.field-parser :as brs.f-parser]
            [gpml.boundary.port.datasource :as port]
            [gpml.util.http-client :as http-client]))

(def ^:private brs-api-odata-queries
  "OData query parameters for each entity we want to import. These are
  filters tailored to import only what is required for the GPML
  platform."
  {:publication {:$select "id,published,updated,thumbnailUrl,authors/value,description/language,description/value,files/language,files/url,keywords/termValueInEnglish,tags/language,tags/value,title/language,title/value,country"
                 :$expand "authors,description,files,keywords,tags,title"
                 :$filter "types/any(x: substringof('Publication', x/value) eq true) and keywords/any(x: x/termValueInEnglish eq 'Plastic') and keywords/any(x: x/termValueInEnglish eq 'Scientific and Technical') and authors/any(x: substringof('Basel Convention', x/value) eq true)"
                 :$orderby "published desc"
                 :$inlinecount "allpages"
                 :$format "json"}
   :meeting {:$select "id,country,city,description,end,imageUrl,location,start,title,status,type,updated,url,brs_linkRecording,brs_linkRegistration,brs_terms"
             :$filter "substringof('plastic', brs_terms) eq true and status eq 'confirmed' and type ne 'expert group'"
             :$orderby "start desc"
             :$inlinecount "allpages"
             :$format "json"}
   :project {:$select "id,ts,name,nameshort,description,datestart,dateend,statusId,statusName,budget,imagesurl,isUmbrella,umbrellaId,umbrellaName,umbrellaNameShort,isGlobal,objectives,activities,webpage,updated,managingOrgId,managingOrgName,Beneficiaries/country,Beneficiaries/countryNameEn,Donors/Name,Donors/shortName,Donors/web,Implementedby/Name,Implementedby/shortName,Implementedby/web,Terms/term"
             :$expand "Beneficiaries,Donors,Implementedby,Terms"
             :$filter "managingOrgName eq 'Secretariat of the Basel, Rotterdam and Stockholm Conventions' and Terms/any(x:x/termId eq guid'5f98dd47-86e5-e311-86cc-0050569d5de3')"
             :$orderby "name"
             :$inlinecount "allpages"
             :$format "json"}})

(defn- get-result-from-body
  [entity body]
  (case entity
    (:publication :project) (get body :value)
    :meeting (get-in body [:d :results])
    body))

(defn- get-count-from-body
  [entity body]
  (case entity
    (:publication :project) (Integer/parseInt (get body :odata.count))
    :meeting (Integer/parseInt (get-in body [:d :__count]))))

(defn- get-data
  [{:keys [logger api-url records-per-page endpoints retry-config] :as config}
   {:keys [entity skip-token]
    :or {skip-token 0}}]
  (try
    (if-not (get (set (keys endpoints)) entity)
      {:success? false
       :reason :entity-not-supported}
      (let [endpoint (get endpoints entity)
            {:keys [status body]}
            (http-client/do-request logger
                                    {:method :get
                                     :url (str api-url endpoint)
                                     :as :json-keyword-keys
                                     :query-params (-> (get brs-api-odata-queries entity)
                                                       (assoc :$top records-per-page)
                                                       (merge (when skip-token {:$skip skip-token})))}
                                    retry-config)]
        (if (<= 200 status 299)
          (let [total-entities (get-count-from-body entity body)
                new-skip-token (+ skip-token records-per-page)
                more-pages? (> total-entities (if (zero? skip-token) new-skip-token skip-token))]
            {:success? true
             :entities (map (partial brs.f-parser/brs-entity->gpml-entity config entity) (get-result-from-body entity body))
             :skip-token new-skip-token
             :more-pages? more-pages?})
          {:success? false
           :error-details body})))
    (catch Exception e
      (let [error-details {:exeception-message (ex-message e)}]
        (log logger :error ::failed-to-get-data error-details)
        {:success? false
         :error-details error-details}))))

(defrecord BRS [logger api-url records-per-page endpoints retry-config]
  port/Datasource
  (get-data [this opts]
    (get-data this opts)))
