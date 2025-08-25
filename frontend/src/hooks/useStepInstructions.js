import { useState, useEffect } from 'react'
import axios from 'axios'
import { getStrapiUrl } from '../utils/misc'

export const useStepInstructions = (stepSlug) => {
  const strapiURL = getStrapiUrl()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!stepSlug) {
      setLoading(false)
      return
    }

    const fetchInstructions = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${strapiURL}/api/step-instructions`, {
          params: {
            'filters[step_slug][$eq]': stepSlug,
            populate: '*',
          },
        })

        if (response.data.data && response.data.data.length > 0) {
          setData(response.data.data[0]?.attributes || null)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInstructions()
  }, [stepSlug])

  return { data, loading, error }
}
