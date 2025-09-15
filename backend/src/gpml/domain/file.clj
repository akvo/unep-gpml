(ns gpml.domain.file
  (:require
   [clojure.string :as str]
   [gpml.domain.miscellaneous :as dom.misc]
   [gpml.domain.types :as dom.types]
   [gpml.util :as util]
   [malli.core :as m]
   [malli.transform :as mt])
  (:import
   (java.io File)))

(def object-key-pattern
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

(def mime-types->common-extensions-mapping
  "There are much more mime-types and extensions but we are just mapping
  the ones used in GPML and omiting those that can be inferred from
  the mime-type directly."
  {"application/vnd.oasis.opendocument.text" "odt"
   "application/vnd.openxmlformats-officedocument.wordprocessingml.document" "docx"
    "application/pdf" "pdf" })

(defn create-file-object-key [entity-key file-key file-id]
  (-> object-key-pattern
      (str/replace #"ENTITY-KEY" (name entity-key))
      (str/replace #"FILE-KEY" (name file-key))
      (str/replace #"FILE-ID" (str file-id))))

(defn decode-file [file]
  (m/decode file-schema file mt/string-transformer))

(defn base64->file [payload entity-key file-key visibility]
  (let [
        [mime-type content] (if (str/starts-with? payload "data:")
                              (let [[_ mime-type content] (re-find #"^data:([^;]+);base64,(.*)$" payload)]
                                [mime-type content])
                              (let [detected-type (try
                                                    (let [bytes (.decode (java.util.Base64/getDecoder) payload)
                                                          header (String. (java.util.Arrays/copyOf bytes (min 8 (alength bytes))))]
                                                      (cond
                                                        (str/starts-with? header "%PDF") "application/pdf"
                                                        (str/starts-with? header "PK") "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                        :else "application/octet-stream"))
                                                    (catch Exception _ "application/octet-stream"))]
                                [detected-type payload]))
        [_ mime-type-suffix] (when mime-type (str/split mime-type #"\/"))
        extension (get mime-types->common-extensions-mapping mime-type mime-type-suffix)
        file-id (util/uuid)]
    {:id file-id
     :object-key (create-file-object-key entity-key file-key file-id)
     :name (format "%s-%s" (name entity-key) file-id)
     :alt-desc nil
     :type mime-type
     :extension extension
     :visibility visibility
     :content content}))
