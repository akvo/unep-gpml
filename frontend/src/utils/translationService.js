import api from './api'
import googleTranslate from './googleTranslate'

class TranslationService {
  constructor() {
    this.cache = new Map()
    this.pendingTranslations = new Map()
    this.googleTranslateClient = googleTranslate
  }

  async getTranslatedResources(
    resources,
    language,
    fields = ['title', 'summary']
  ) {
    if (!resources || resources.length === 0 || language === 'en') {
      return resources
    }

    try {
      const topics = resources.map((r) => `${r.type}:${r.id}`).join(',')

      const existingTranslations = await this.fetchBulkTranslations(
        topics,
        language,
        fields
      )

      const translationMap = new Map()
      existingTranslations.forEach((trans) => {
        translationMap.set(`${trans.topicType}:${trans.topicId}`, trans.content)
      })

      const toTranslate = []
      const translatedResources = resources.map((resource) => {
        const key = `${resource.type}:${resource.id}`
        const translation = translationMap.get(key)

        if (translation && this.hasRequiredFields(translation, fields)) {
          return {
            ...resource,
            ...this.applyTranslation(resource, translation, fields),
          }
        } else {
          toTranslate.push(resource)
          return resource
        }
      })

      if (toTranslate.length > 0) {
        const newTranslations = await this.autoTranslateResources(
          toTranslate,
          language,
          fields
        )

        if (newTranslations.length > 0) {
          await this.saveBulkTranslations(newTranslations, language)
        }

        const newTranslationMap = new Map()
        newTranslations.forEach((trans) => {
          newTranslationMap.set(
            `${trans.topic_type}:${trans.topic_id}`,
            trans.content
          )
        })

        return translatedResources.map((resource) => {
          const key = `${resource.type}:${resource.id}`
          const newTranslation = newTranslationMap.get(key)

          if (newTranslation) {
            return {
              ...resource,
              ...this.applyTranslation(resource, newTranslation, fields),
            }
          }
          return resource
        })
      }

      return translatedResources
    } catch (error) {
      console.error('Error in translation process:', error)
      return resources
    }
  }

  async fetchBulkTranslations(topics, language, fields) {
    try {
      const params = new URLSearchParams({
        topics,
        language,
        fields: fields.join(','),
      })

      if (typeof window === 'undefined') {
        const response = await fetch(`/bulk-translations?${params.toString()}`)
        const data = await response.json()
        return data.translations || []
      } else {
        const response = await api.get(
          `/bulk-translations?${params.toString()}`
        )
        return response.data.translations || []
      }
    } catch (error) {
      console.error('Error fetching translations:', error)
      return []
    }
  }

  async autoTranslateResources(resources, targetLanguage, fields) {
    const translations = []

    const batchSize = 10
    const batches = []

    for (let i = 0; i < resources.length; i += batchSize) {
      batches.push(resources.slice(i, i + batchSize))
    }

    for (const batch of batches) {
      try {
        const translatedBatch = await this.translateBatch(
          batch,
          targetLanguage,
          fields
        )
        translations.push(...translatedBatch)
      } catch (error) {
        console.error('Error translating batch:', error)
      }
    }

    return translations
  }

  async translateBatch(batch, targetLanguage, fields) {
    const translations = []

    const textsToTranslate = []
    const textMapping = []

    batch.forEach((resource) => {
      fields.forEach((field) => {
        if (resource[field]) {
          textsToTranslate.push(resource[field])
          textMapping.push({
            resourceId: resource.id,
            field,
            type: resource.type,
          })
        }
      })
    })

    if (textsToTranslate.length === 0) {
      return translations
    }

    try {
      const translatedTexts = await this.callGoogleTranslate(
        textsToTranslate,
        targetLanguage
      )

      const resourceTranslations = new Map()

      translatedTexts.forEach((translatedText, index) => {
        const mapping = textMapping[index]
        const key = `${mapping.type}:${mapping.resourceId}`

        if (!resourceTranslations.has(key)) {
          resourceTranslations.set(key, {
            topic_type: mapping.type,
            topic_id: mapping.resourceId,
            content: {},
          })
        }

        resourceTranslations.get(key).content[mapping.field] = translatedText
      })

      return Array.from(resourceTranslations.values())
    } catch (error) {
      console.error('Error calling Google Translate:', error)
      return translations
    }
  }

  async callGoogleTranslate(texts, targetLanguage) {
    try {
      const translatedTexts = await this.googleTranslateClient.translateTexts(
        texts,
        targetLanguage,
        'en'
      )
      console.log('Translated texts:', translatedTexts)
      return translatedTexts
    } catch (error) {
      console.error('Google Translate API error:', error)
      return texts
    }
  }

  async saveBulkTranslations(translations, language) {
    try {
      const payload = translations.map((trans) => ({
        'topic-type': trans.topic_type,
        'topic-id': trans.topic_id,
        language,
        content: trans.content,
      }))

      if (typeof window === 'undefined') {
        const response = await fetch(`/bulk-translations`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error(`Failed to save translations: ${response.status}`)
        }

        return await response.json()
      } else {
        const response = await api.put('/bulk-translations', payload)
        return response.data
      }
    } catch (error) {
      console.error('Error saving translations:', error)
    }
  }

  hasRequiredFields(translation, fields) {
    return fields.every(
      (field) => translation[field] && translation[field].trim() !== ''
    )
  }

  applyTranslation(resource, translation, fields) {
    const translated = {}
    fields.forEach((field) => {
      if (translation[field]) {
        translated[field] = translation[field]
      }
    })
    return translated
  }

  getAuthToken() {
    return localStorage.getItem('idToken') || ''
  }

  clearCache() {
    this.cache.clear()
    this.pendingTranslations.clear()
  }
}

export default new TranslationService()
