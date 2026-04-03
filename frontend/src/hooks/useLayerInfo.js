import axios from 'axios'
import { useEffect, useState } from 'react'
import { getStrapiUrl } from '../utils/misc'
import { useRouter } from 'next/router'

const tradeLayers = [
  'Plastics_in_primary_forms___weight__import__WFL1',
  'Intermediate_forms_of_plastic_weight____import__WFL1',
  'Final_manufactured_plastics_goods___weight__import__WFL1',
  'Intermediate___weight__import__WFL1',
  'Plastic_waste_weigth____import__WFL1',
  'Plastics_in_primary_forms___weight__export__WFL1',
  'Intermediate_forms_of_plastic_weight____export__WFL1',
  'Final_manufactured_plastics_goods_weight____export__WFL1',
  'Intermediate___weight__export__WFL1',
  'Plastic_waste_weigth____export__WFL1',
  'Final_manufactured_plastic_goods___value__import__WFL1',
  'Intermediate_forms_of_plastic___value__import__WFL1',
  'Plastic_packaging___value__import__V2_WFL1',
  'Plastic_in_primary_form___value__import__V2_WFL1',
  'Total_plastic___value__import__V2_WFL1',
  'Total_plastic___value__export__V2_WFL1',
  'Plastic_packaging___weight__import__WFL1',
  'Plastic_waste___value__import__V2_WFL1',
  'Plastic_packaging___value__export__V2_WFL1',
  'Plastic_packaging___weight__export__WFL1',
  'Plastic_in_primary_form___value__export__V2_WFL1',
  'Plastic_waste___value__export__V2_WFL1',
  'Final_manufactured_plastic_goods___value__export__V2_WFL1',
  'Intermediate_forms_of_plastic___value__export__V2_WFL1',
  'Intermediate_man___value__import__V2_WFL1',
  'Intermediate_man___value__export__WFL1',
]

// Fetch items with limited concurrency to avoid overwhelming the server
const fetchWithConcurrency = async (items, fetchFn, concurrency = 5) => {
  const results = []
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(fetchFn))
    results.push(...batchResults)
  }
  return results
}

const useLayerInfo = () => {
  const [layers, setLayers] = useState([])
  const [loading, setLoading] = useState(true)
  const strapiURL = getStrapiUrl()
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    const fetchLayerValues = async (d) => {
      try {
        const getValues = await axios.get(
          `${strapiURL}/api/layercollections/${d.attributes.arcgislayerId}`
        )
        return {
          ...d,
          attributes: {
            ...d.attributes,
            ValuePerCountry: getValues.data ?? [],
          },
        }
      } catch (valueError) {
        console.error(
          `Error fetching values for layer ${d.attributes.arcgislayerId}:`,
          valueError
        )
        return {
          ...d,
          attributes: {
            ...d.attributes,
            ValuePerCountry: [],
          },
        }
      }
    }

    const fetchLayers = async () => {
      if (router.query.useDataLayers) {
        try {
          const response = await axios.get(
            `${strapiURL}/api/layers?locale=${router.locale}&pagination[pageSize]=150&sort[order]=asc`
          )

          const updateLayer = await fetchWithConcurrency(
            response.data.data,
            fetchLayerValues,
            5
          )

          if (!cancelled) {
            setLayers(updateLayer || response.data.data || [])
            setLoading(false)
          }
        } catch (error) {
          console.error('Error fetching Layers:', error)
          if (!cancelled) {
            setLayers([])
            setLoading(false)
          }
        }
      } else {
        try {
          const response = await axios.get(
            `${strapiURL}/api/layers?locale=${router.locale}&pagination[pageSize]=150&sort[order]=asc&populate=ValuePerCountry`
          )

          const tradeLayerItems = response.data.data.filter((d) =>
            tradeLayers.includes(d.attributes.arcgislayerId)
          )
          const nonTradeLayerItems = response.data.data.filter((d) =>
            !tradeLayers.includes(d.attributes.arcgislayerId)
          )

          const enrichedTradeLayers = await fetchWithConcurrency(
            tradeLayerItems,
            fetchLayerValues,
            5
          )

          if (!cancelled) {
            setLayers([...nonTradeLayerItems, ...enrichedTradeLayers])
            setLoading(false)
          }
        } catch (error) {
          console.error('Error fetching Layers:', error)
          if (!cancelled) {
            setLayers([])
            setLoading(false)
          }
        }
      }
    }

    fetchLayers()

    return () => {
      cancelled = true
    }
  }, [router.locale])

  return { layers, loading }
}

export default useLayerInfo
