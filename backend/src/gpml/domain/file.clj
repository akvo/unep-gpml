(ns gpml.domain.file
  (:require [clojure.string :as str]
            [gpml.domain.miscellaneous :as dom.misc]
            [gpml.domain.types :as dom.types]
            [gpml.util :as util]
            [malli.core :as m])
  (:import [java.io File]))

(def ^:const object-key-pattern
  "Pattern to define the object key of the file in the object storage.
  Example:

  - event/images/12fd5c76-7f12-4084-a9ca-a834d030977d"
  "ENTITY-KEY/FILE-KEY/FILE-ID")

(def file-schema
  (m/schema
   [:map
    {:closed true}
    [:id uuid?]
    [:object-key
     [:string
      {:min 1}]]
    [:name
     [:string
      {:min 1}]]
    [:alt-desc
     {:optional true}
     [:maybe
      [:string
       {:min 1}]]]
    [:type
     [:string
      {:min 1}]]
    [:extension
     {:optional true}
     [:maybe
      [:string]]]
    [:visibility
     (dom.types/get-type-schema :file-visibility)]
    [:content
     {:optional true}
     [:or
      dom.misc/base64-schema
      [:fn #(instance? File %)]]]
    [:created-at inst?]
    [:last-updated-at
     {:optional true}
     inst?]]))

(defn create-file-object-key
  [entity-key file-key file-id]
  (-> object-key-pattern
      (str/replace #"ENTITY-KEY" (name entity-key))
      (str/replace #"FILE-KEY" (name file-key))
      (str/replace #"FILE-ID" (str file-id))))

(defn base64->file
  [payload entity-key file-key visibility]
  (let [[_ ^String content-type ^String content] (re-find #"^data:(\S+);base64,(.*)$" payload)
        [_ extension] (str/split content-type #"\/")
        file-id (util/uuid)]
    {:id file-id
     :object-key (create-file-object-key entity-key file-key file-id)
     :name (format "%s-%s" (name entity-key) file-id)
     :alt-desc nil
     :type content-type
     :extension extension
     :visibility visibility
     :content content}))
