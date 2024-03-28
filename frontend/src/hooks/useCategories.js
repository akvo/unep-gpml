import axios from 'axios'
import { useEffect, useState } from 'react'

const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('xxxx1')
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          'https://unep-gpml.akvotest.org/strapi/content-manager/collection-types/api::category.category?page=1&pageSize=10&sort=categoryId:ASC',
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzExNDY0MTU5LCJleHAiOjE3MTQwNTYxNTl9.sNlJQO8qvTrKyJrM0FlsQ11TGcLDOEzz63PUius0LxU`,
            },
          }
        )

        setCategories(response.data || [])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])
  console.log("xxxxx', categ")
  return { categories, loading }
}

export default useCategories
