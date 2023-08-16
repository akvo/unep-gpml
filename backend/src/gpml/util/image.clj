(ns gpml.util.image
  (:require [gpml.util :as util]
            [gpml.util.http-client :as http-client]))

(defn download-image
  ([logger url] (download-image logger url {}))
  ([logger url req-opts]
   (let [{:keys [status headers body]}
         (http-client/do-request logger
                                 (merge
                                  {:method :get
                                   :url url
                                   :as :byte-array}
                                  req-opts)
                                 {})]
     (when (<= 200 status 299)
       (->> body
            util/encode-base64
            (util/add-base64-header (get headers "Content-Type")))))))
