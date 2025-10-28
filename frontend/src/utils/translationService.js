import api from './api'

class TranslationService {
  constructor() {
    this.cache = new Map()
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

      const translatedResources = resources.map((resource) => {
        const key = `${resource.type}:${resource.id}`
        const translation = translationMap.get(key)

        if (translation) {
          const translatedFields = {}
          fields.forEach((field) => {
            if (translation[field] && translation[field].trim() !== '') {
              translatedFields[field] = translation[field]
            }
          })
          return {
            ...resource,
            ...translatedFields,
          }
        }

        return resource
      })

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

      const response = await api.get(`/bulk-translations?${params.toString()}`)
      return response.data.translations || []
    } catch (error) {
      console.error('Error fetching translations:', error)
      return []
    }
  }

  clearCache() {
    this.cache.clear()
  }
}

export default new TranslationService()
