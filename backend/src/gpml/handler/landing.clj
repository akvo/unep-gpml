(ns gpml.handler.landing
  (:require [integrant.core :as ig]
            [ring.util.response :as resp]
            [gpml.handler.browse :as browse]
            [gpml.db.country :as db.country]))

(defn sample-map-data [countries]
  (map #(merge % {:project (rand-int 10),
                  :event (rand-int 10),
                  :policy (rand-int 10),
                  :technology (rand-int 10)
                  :resource (rand-int 10)}) countries))

(defn landing-sample-response [countries]
  (resp/response {:topics browse/sample-data :map (sample-map-data countries)}))

(defmethod ig/init-key :gpml.handler.landing/handler [_ {:keys [db]}]
  (fn [_]
    (let [conn (:spec db)
          countries (db.country/all-countries conn)]
      (landing-sample-response countries))))


(comment
  (require 'integrant.repl.state)
  (let [db (:spec (:duct.database.sql/hikaricp integrant.repl.state/system))]
    (map #(merge % {:project 1}) (db.country/all-countries db)))
  (rand-int 10)
  )
