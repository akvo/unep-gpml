(ns gpml.boundary.port.translate
  "Protocol for translation services.
   Defines the interface for translating text content between languages.")

(defprotocol TranslationService
  "Protocol for text translation operations."
  :extend-via-metadata true

  (translate-texts [this texts target-language source-language]
    "Translate multiple texts from source language to target language.

     Parameters:
     - texts: Vector of strings to translate
     - target-language: ISO language code (e.g., 'es', 'fr', 'zh')
     - source-language: ISO language code (e.g., 'en')

     Returns:
     Vector of translated strings in the same order as input.

     Throws exception on error (API failure, network error, etc.)"))
