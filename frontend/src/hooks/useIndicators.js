import axios from 'axios'
import { useEffect, useState } from 'react'

const useLayers = (subcategoryId) => {
  const [layers, setLayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLayers = async () => {
      try {
        console.log('subcatlayer', subcategoryId)
        const response = await axios.get(
          `https://unep-gpml.akvotest.org/strapi/content-manager/collection-types/api::layer.layer?page=1&pageSize=100&sort=subcategoryId:ASC&filters[$and][0][subcategoryId][$eq]=${subcategoryId}`,

          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzExNDY0MTU5LCJleHAiOjE3MTQwNTYxNTl9.sNlJQO8qvTrKyJrM0FlsQ11TGcLDOEzz63PUius0LxU`,
            },
          }
        )

        setLayers(response.data.results || [])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setLoading(false)
      }
    }

    fetchLayers()
  }, [subcategoryId])

  return { layers, loading }
}

export default useLayers
