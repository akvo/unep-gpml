import axios from 'axios'
import { useEffect, useState } from 'react'

const useSubcategories = (categoryId) => {
  const [subcategories, setSubategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubategories = async () => {
      try {
        const response = await axios.get(
          `https://unep-gpml.akvotest.org/strapi/content-manager/collection-types/api::subcategory.subcategory?page=1&pageSize=100&sort=categoryId:ASC&filters[$and][0][categoryId][$eq]=${categoryId}`,
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzExNDY0MTU5LCJleHAiOjE3MTQwNTYxNTl9.sNlJQO8qvTrKyJrM0FlsQ11TGcLDOEzz63PUius0LxU`,
            },
          }
        )

        setSubategories(response.data.results || [])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setLoading(false)
      }
    }

    fetchSubategories()
  }, [categoryId])
  console.log("xxxxx', categ")
  return { subcategories, loading }
}

export default useSubcategories
