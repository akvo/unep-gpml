export const googleTranslateConfig = {
  apiKey: 'api-key-here',
  apiUrl: 'https://translation.googleapis.com/language/translate/v2',

  limits: {
    maxTextsPerRequest: 128,
    maxCharactersPerRequest: 30000,
    maxCharactersPerText: 5000,
  },

  supportedLanguages: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
  ],

  retry: {
    maxAttempts: 3,
    delayMs: 1000,
  },
}

export class GoogleTranslateClient {
  constructor(apiKey) {
    this.apiKey = apiKey || googleTranslateConfig.apiKey
  }

  async translateTexts(texts, targetLanguage, sourceLanguage = 'en') {
    if (!this.apiKey) {
      throw new Error('Google Translate API key is not configured')
    }

    const results = []
    const {
      maxTextsPerRequest,
      maxCharactersPerRequest,
    } = googleTranslateConfig.limits

    const batches = this.createBatches(
      texts,
      maxTextsPerRequest,
      maxCharactersPerRequest
    )

    for (const batch of batches) {
      try {
        const translatedBatch = await this.translateBatch(
          batch,
          targetLanguage,
          sourceLanguage
        )
        results.push(...translatedBatch)
      } catch (error) {
        console.error('Error translating batch:', error)
        results.push(...batch)
      }
    }

    return results
  }

  async translateBatch(texts, targetLanguage, sourceLanguage, attempt = 1) {
    const { apiUrl, retry } = googleTranslateConfig

    const isServer = typeof window === 'undefined'

    const headers = {
      'Content-Type': 'application/json',
    }

    if (isServer) {
      headers['Referer'] =
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    }

    try {
      const response = await fetch(`${apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          q: texts,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text',
        }),
      })

      if (response.status === 429 && attempt < retry.maxAttempts) {
        const delay = retry.delayMs * Math.pow(2, attempt - 1)
        await this.sleep(delay)
        return this.translateBatch(
          texts,
          targetLanguage,
          sourceLanguage,
          attempt + 1
        )
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Google Translate API error: ${response.status} - ${
            errorData.error?.message || 'Unknown error'
          }`
        )
      }

      const data = await response.json()

      if (data.data?.translations) {
        return data.data.translations.map((t) => t.translatedText)
      }

      throw new Error('Invalid response from Google Translate API')
    } catch (error) {
      if (attempt < retry.maxAttempts && !error.message.includes('API key')) {
        const delay = retry.delayMs * Math.pow(2, attempt - 1)
        await this.sleep(delay)
        return this.translateBatch(
          texts,
          targetLanguage,
          sourceLanguage,
          attempt + 1
        )
      }
      throw error
    }
  }

  createBatches(texts, maxTexts, maxChars) {
    const batches = []
    let currentBatch = []
    let currentChars = 0

    for (const text of texts) {
      const textLength = text.length

      if (
        currentBatch.length >= maxTexts ||
        (currentChars + textLength > maxChars && currentBatch.length > 0)
      ) {
        batches.push(currentBatch)
        currentBatch = []
        currentChars = 0
      }

      if (textLength > googleTranslateConfig.limits.maxCharactersPerText) {
        console.warn(
          `Text exceeds maximum length (${textLength} chars), truncating...`
        )
        currentBatch.push(
          text.substring(0, googleTranslateConfig.limits.maxCharactersPerText)
        )
        currentChars += googleTranslateConfig.limits.maxCharactersPerText
      } else {
        currentBatch.push(text)
        currentChars += textLength
      }
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch)
    }

    return batches
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async detectLanguage(text) {
    if (!this.apiKey) {
      throw new Error('Google Translate API key is not configured')
    }

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2/detect?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ q: text }),
        }
      )

      if (!response.ok) {
        throw new Error(`Language detection failed: ${response.status}`)
      }

      const data = await response.json()
      return data.data?.detections?.[0]?.[0]?.language || 'unknown'
    } catch (error) {
      console.error('Error detecting language:', error)
      return 'unknown'
    }
  }

  async getSupportedLanguages(targetLanguage = 'en') {
    if (!this.apiKey) {
      throw new Error('Google Translate API key is not configured')
    }

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2/languages?key=${this.apiKey}&target=${targetLanguage}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch supported languages: ${response.status}`
        )
      }

      const data = await response.json()
      return data.data?.languages || []
    } catch (error) {
      console.error('Error fetching supported languages:', error)
      return googleTranslateConfig.supportedLanguages
    }
  }
}

export const googleTranslate = new GoogleTranslateClient()

export async function validateApiKey(apiKey) {
  try {
    const testText = 'Hello'
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: [testText],
          source: 'en',
          target: 'es',
          format: 'text',
        }),
      }
    )

    return response.ok
  } catch (error) {
    console.error('API key validation error:', error)
    return false
  }
}

export default googleTranslate
