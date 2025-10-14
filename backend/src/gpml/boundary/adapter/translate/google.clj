(ns gpml.boundary.adapter.translate.google
  "Google Translate API v2 adapter implementation.

   API Documentation: https://cloud.google.com/translate/docs/reference/rest/v2/translate

   API Limits:
   - Maximum 128 texts per request
   - Maximum 30,000 characters per request
   - Maximum 5,000 characters per text
   - Rate limit: varies by quota (default: 300,000 chars/minute)"
  (:require
   [clojure.string :as str]
   [duct.logger :refer [log]]
   [gpml.boundary.port.translate :as port]
   [gpml.util.http-client :as http-client]
   [integrant.core :as ig]))

;; API Configuration
(def api-url "https://translation.googleapis.com/language/translate/v2")

(def api-limits
  {:max-texts-per-request 128
   :max-characters-per-request 30000
   :max-characters-per-text 5000})

(def default-retry-config
  {:timeout 30000
   :max-retries 3
   :backoff-ms [500 5000 2.0]}) ;; [initial-delay max-delay multiplier]

;; Helper Functions

(defn- count-characters
  "Count total characters in a collection of texts."
  [texts]
  (reduce + (map count texts)))

(defn- truncate-text
  "Truncate text to maximum allowed length."
  [text max-length]
  (if (> (count text) max-length)
    (do
      (println (format "WARNING: Text exceeds %d characters (%d), truncating..."
                       max-length (count text)))
      (subs text 0 max-length))
    text))

(defn- create-batches
  "Split texts into batches respecting API limits.

   Parameters:
   - texts: Vector of strings to batch
   - max-texts: Maximum texts per batch
   - max-chars: Maximum characters per batch

   Returns:
   Vector of batches, where each batch is a vector of texts."
  [texts max-texts max-chars]
  (let [max-char-per-text (:max-characters-per-text api-limits)]
    (loop [remaining (vec texts)
           batches []
           current-batch []
           current-chars 0]
      (if (empty? remaining)
        (if (empty? current-batch)
          batches
          (conj batches current-batch))
        (let [text (first remaining)
              truncated-text (truncate-text text max-char-per-text)
              text-length (count truncated-text)
              would-exceed-texts? (>= (count current-batch) max-texts)
              would-exceed-chars? (and (pos? (count current-batch))
                                       (> (+ current-chars text-length) max-chars))]
          (if (or would-exceed-texts? would-exceed-chars?)
            ;; Start new batch
            (recur (rest remaining)
                   (conj batches current-batch)
                   [truncated-text]
                   text-length)
            ;; Add to current batch
            (recur (rest remaining)
                   batches
                   (conj current-batch truncated-text)
                   (+ current-chars text-length))))))))

(defn- build-api-request
  "Build Google Translate API request payload.

   Parameters:
   - texts: Vector of strings to translate
   - target-language: Target language ISO code
   - source-language: Source language ISO code

   Returns:
   Map representing the request body."
  [texts target-language source-language]
  {:q texts
   :source source-language
   :target target-language
   :format "text"})

(defn- parse-api-response
  "Parse Google Translate API response.

   Parameters:
   - response: HTTP response from Google Translate API

   Returns:
   Vector of translated strings.

   Throws:
   Exception if response is invalid or contains errors."
  [response]
  (let [status (:status response)
        body (:body response)]
    (cond
      ;; Success
      (and (<= 200 status 299)
           (get-in body [:data :translations]))
      (mapv :translatedText (get-in body [:data :translations]))

      ;; Error responses
      (= status 401)
      (throw (ex-info "Google Translate API authentication failed - invalid API key"
                      {:reason :unauthorized
                       :status status
                       :error-details (get-in body [:error :message])}))

      (= status 403)
      (throw (ex-info "Google Translate API access forbidden - check API key permissions"
                      {:reason :forbidden
                       :status status
                       :error-details (get-in body [:error :message])}))

      (= status 429)
      (throw (ex-info "Google Translate API rate limit exceeded"
                      {:reason :rate-limit-exceeded
                       :status status
                       :error-details (get-in body [:error :message])}))

      (>= status 500)
      (throw (ex-info "Google Translate API server error"
                      {:reason :server-error
                       :status status
                       :error-details (get-in body [:error :message])}))

      :else
      (throw (ex-info "Google Translate API request failed"
                      {:reason :api-error
                       :status status
                       :body body})))))

(defn- translate-batch
  "Translate a single batch of texts using Google Translate API.

   Parameters:
   - logger: Duct logger instance
   - api-key: Google Translate API key
   - texts: Vector of strings to translate (must fit in one API request)
   - target-language: Target language ISO code
   - source-language: Source language ISO code
   - retry-config: Retry configuration map

   Returns:
   Vector of translated strings.

   Throws:
   Exception on API errors or network failures."
  [logger api-key texts target-language source-language retry-config]
  (let [request-body (build-api-request texts target-language source-language)
        url (str api-url "?key=" api-key)
        request {:url url
                 :method :post
                 :body request-body
                 :as :json-keyword-keys}]
    (log logger :info :google-translate-request
         {:text-count (count texts)
           :char-count (count-characters texts)
          :target-language target-language
          :source-language source-language})
    (try
      (let [response (http-client/request logger request retry-config)]
        (parse-api-response response))
      (catch Exception e
        (log logger :error :google-translate-failed
             {:text-count (count texts)
              :target-language target-language
              :error (ex-message e)
              :error-data (ex-data e)})
        (throw e)))))

;; Protocol Implementation

(defrecord GoogleTranslateAdapter [api-key logger retry-config]
  port/TranslationService

  (translate-texts [_this texts target-language source-language]
    (when (empty? texts)
      (throw (ex-info "Cannot translate empty text list"
                      {:reason :invalid-input})))

    (when (str/blank? api-key)
      (throw (ex-info "Google Translate API key is not configured"
                      {:reason :missing-api-key})))

    (let [{:keys [max-texts-per-request max-characters-per-request]} api-limits
          batches (create-batches texts max-texts-per-request max-characters-per-request)
          batch-count (count batches)]

      (log logger :info :google-translate-batching
           {:total-texts (count texts)
            :total-batches batch-count
            :target-language target-language})

      (loop [remaining-batches batches
             results []]
        (if (empty? remaining-batches)
          results
          (let [batch (first remaining-batches)
                translated-batch (translate-batch logger
                                                  api-key
                                                  batch
                                                  target-language
                                                  source-language
                                                  retry-config)]
            (recur (rest remaining-batches)
                   (into results translated-batch))))))))

;; Integrant Initialization

(defmethod ig/init-key ::adapter [_ {:keys [api-key logger retry-config]}]
  (when (str/blank? api-key)
    (throw (ex-info "Google Translate API key is required"
                    {:reason :missing-config
                     :key :api-key})))
  (->GoogleTranslateAdapter api-key
                            logger
                            (merge default-retry-config retry-config)))

;; Public API Functions

(defn create-adapter
  "Create a Google Translate adapter instance.

   Parameters:
   - config: Map with keys:
     - :api-key (required) - Google Translate API key
     - :logger (required) - Duct logger instance
     - :retry-config (optional) - Retry configuration overrides

   Returns:
   GoogleTranslateAdapter instance implementing TranslationService protocol."
  [{:keys [api-key logger retry-config]}]
  (when (or (nil? api-key) (str/blank? api-key))
    (throw (ex-info "Google Translate API key is required"
                    {:reason :missing-api-key})))
  (->GoogleTranslateAdapter api-key
                            logger
                            (merge default-retry-config retry-config)))

(comment
  ;; Manual REPL-driven tests for Google Translate adapter
  ;; Requires GOOGLE_TRANSLATE_API_KEY environment variable to be set
  ;;
  ;; Usage:
  ;; 1. Set your API key: export GOOGLE_TRANSLATE_API_KEY="your-key-here"
  ;; 2. Start REPL: make lein-repl
  ;; 3. Evaluate expressions below

  ;; Get the adapter from the running system
  @(def adapter (dev/component ::adapter))

  ;; Test 1: Translate single text
  (port/translate-texts adapter
                        ["Hello, world!"]
                        "es"  ;; target: Spanish
                        "en") ;; source: English
  ;; Expected: ["¡Hola Mundo!"] or similar

  ;; Test 2: Translate multiple texts
  (port/translate-texts adapter
                        ["Hello" "Goodbye" "Thank you" "How are you?"]
                        "fr"  ;; target: French
                        "en")
  ;; Expected: ["Bonjour" "Au revoir" "Merci" "Comment allez-vous?"] or similar

  ;; Test 3: Translate to multiple languages
  (doseq [lang ["es" "fr" "de" "ja" "zh"]]
    (println (format "%s: %s" lang
                     (first (port/translate-texts adapter
                                                  ["Hello"]
                                                  lang
                                                  "en")))))
  ;; Expected: Translations in Spanish, French, German, Japanese, Chinese

  ;; Test 4: Large batch (tests batching logic)
  (def large-batch (vec (repeat 250 "Hello")))
  (def results (port/translate-texts adapter large-batch "es" "en"))
  (count results)
  ;; Expected: 250

  ;; Test 5: Character limit batching (10 texts of 4000 chars each)
  (def long-text (apply str (repeat 4000 "a")))
  (def long-batch (vec (repeat 10 long-text)))
  (def long-results (port/translate-texts adapter long-batch "es" "en"))
  (count long-results)
  ;; Expected: 10

  ;; Test 6: Text truncation (exceeds 5000 char limit)
  (def very-long-text (apply str (repeat 6000 "a")))
  (def truncated-result (port/translate-texts adapter [very-long-text] "es" "en"))
  ;; Expected: Translation of truncated text (5000 chars), with WARNING printed

  ;; Test 7: Empty input (should throw exception)
  (try
    (port/translate-texts adapter [] "es" "en")
    (catch Exception e
      (println "Expected error:" (ex-message e))))
  ;; Expected: "Cannot translate empty text list"

  ;; Test 8: Verify batching with mixed text lengths
  (def mixed-texts ["Short"
                    (apply str (repeat 3000 "m"))
                    "Medium text"
                    (apply str (repeat 4000 "l"))
                    "Another short"])
  (def mixed-results (port/translate-texts adapter mixed-texts "es" "en"))
  (= (count mixed-texts) (count mixed-results))
  ;; Expected: true

  ;; Test 9: Create adapter with custom retry config
  @(def custom-adapter
     (create-adapter {:api-key (System/getenv "GOOGLE_TRANSLATE_API_KEY")
                      :logger (dev/component :duct/logger)
                      :retry-config {:timeout 10000
                                     :max-retries 5
                                     :backoff-ms [1000 10000 3.0]}}))
  (port/translate-texts custom-adapter ["Test"] "es" "en")
  ;; Expected: ["Prueba"] or similar

  ;; Test 10: Invalid API key (should fail gracefully)
  @(def invalid-adapter
     (create-adapter {:api-key "invalid-key-12345"
                      :logger (dev/component :duct/logger)}))
  (try
    (port/translate-texts invalid-adapter ["Hello"] "es" "en")
    (catch Exception e
      (println "Expected auth error:" (ex-message e))
      (println "Error data:" (ex-data e))))
  ;; Expected: "Google Translate API authentication failed - invalid API key"

  ;; Test 11: Performance test - translate 100 texts
  (time
   (let [texts (vec (repeat 100 "Translate this text"))
         results (port/translate-texts adapter texts "es" "en")]
     (println "Translated" (count results) "texts")))
  ;; Expected: Completes in reasonable time (< 5 seconds)

  ;; Cleanup - test validation at adapter creation
  (try
    (create-adapter {:api-key ""
                     :logger (dev/component :duct/logger)})
    (catch Exception e
      (println "Expected validation error:" (ex-message e))))
  ;; Expected: "Google Translate API key is required"

  ;; Helper: Test API limits constants
  api-limits
  ;; Expected: {:max-texts-per-request 128
  ;;            :max-characters-per-request 30000
  ;;            :max-characters-per-text 5000}

  default-retry-config
  ;; Expected: {:timeout 30000
  ;;            :max-retries 3
  ;;            :backoff-ms [500 5000 2.0]}

  ;;
  )
