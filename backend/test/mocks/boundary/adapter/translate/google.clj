(ns mocks.boundary.adapter.translate.google
  "Mock Google Translate adapter for local development.
   Returns prefixed text instead of actually translating."
  (:require
   [clojure.string]
   [gpml.boundary.port.translate :as port]
   [integrant.core :as ig]))

(defn mock-translate-texts
  "Mock translation that prefixes text with language code.
   Example: 'Hello' -> '[ES] Hello'"
  [_adapter texts target-language _source-language]
  (mapv (fn [text]
          (str "[" (clojure.string/upper-case target-language) "] " text))
        texts))

(defrecord MockGoogleTranslateAdapter [enabled?]
  port/TranslationService
  (translate-texts [this texts target-language source-language]
    (if enabled?
      (mock-translate-texts this texts target-language source-language)
      ;; If disabled, throw error to simulate missing API key
      (throw (ex-info "Mock Google Translate adapter is disabled"
                      {:reason :adapter-disabled
                       :hint "Set :enabled? true in config or provide real API key"})))))

(defn create-mock-adapter
  "Create a mock Google Translate adapter instance.

   Parameters:
   - config: Map with keys:
     - :enabled? (optional) - Enable/disable mock (default: true)

   Returns:
   MockGoogleTranslateAdapter instance implementing TranslationService protocol."
  [{:keys [enabled?] :or {enabled? true}}]
  (->MockGoogleTranslateAdapter enabled?))

(defmethod ig/init-key :mocks.boundary.adapter.translate/google
  [_ config]
  (create-mock-adapter config))

(comment
  ;; Usage examples for local development

  ;; Get mock adapter from system
  @(def mock-adapter (dev/component :mocks.boundary.adapter.translate/google))

  ;; Or create directly
  @(def mock-adapter (create-mock-adapter {:enabled? true}))

  ;; Test translation
  (port/translate-texts mock-adapter
                        ["Hello, world!" "Goodbye"]
                        "es"
                        "en")
  ;; => ["[ES] Hello, world!" "[ES] Goodbye"]

  ;; Test with French
  (port/translate-texts mock-adapter
                        ["Welcome" "Thank you"]
                        "fr"
                        "en")
  ;; => ["[FR] Welcome" "[FR] Thank you"]

  ;; Test disabled adapter (simulates missing API key)
  @(def disabled-adapter (create-mock-adapter {:enabled? false}))
  (try
    (port/translate-texts disabled-adapter ["Hello"] "es" "en")
    (catch Exception e
      (println "Error:" (ex-message e))))
  ;; => "Error: Mock Google Translate adapter is disabled"

  ;;
  )
