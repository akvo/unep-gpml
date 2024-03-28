import axios from 'axios'
import { useEffect, useState } from 'react'

const useLayerInfo = () => {
  const [layers, setLayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLayers = async () => {
      try {
        const response = await axios.get(
          `https://unep-gpml.akvotest.org/strapi/content-manager/collection-types/api::layer.layer?page=1&pageSize=1000&sort=id:ASC`,
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzExNDY0MTU5LCJleHAiOjE3MTQwNTYxNTl9.sNlJQO8qvTrKyJrM0FlsQ11TGcLDOEzz63PUius0LxU`,
            },
          }
        )

        setLayers(response.data || [])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching Layers:', error)
        setLoading(false)
      }
    }

    fetchLayers()
  }, [])
  console.log("xxxxx', categ")
  return { layers, loading }
}

export default useLayerInfo
