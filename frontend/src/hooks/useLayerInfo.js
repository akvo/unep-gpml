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

// Layers that need individual fetches for English locale
// (the rest are already populated via ?populate=ValuePerCountry)
const enOnlyLayers = [
  'Final_manufactured_plastic_goods___value__export__V2_WFL1',
  'Total_plastic___value__export__V2_WFL1',
  'Plastic_waste_weigth____export__WFL1',
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

// Options:
//   countryCode — when provided, filters ValuePerCountry to that country only (Fix 1)
//   layerIds    — when provided as a non-null array, filters to specific layers (Fix 2)
//                 null means "caller not ready yet, hold off fetching"
//                 undefined means "no filter, fetch all" (maps page default)
const useLayerInfo = ({ countryCode = null, layerIds = undefined } = {}) => {
  const [layers, setLayers] = useState([])
  const [loading, setLoading] = useState(true)
  const strapiURL = getStrapiUrl()
  const router = useRouter()

  useEffect(() => {
    // Caller signals it's not ready (e.g. categories still loading)
    if (layerIds === null) return

    setLoading(true)
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
      const currentLocale = router.locale

      // Build layer ID filter when specific layers are requested (Fix 2)
      const layerIdQuery =
        Array.isArray(layerIds) && layerIds.length > 0
          ? layerIds
              .map(
                (id, i) =>
                  `filters[arcgislayerId][$in][${i}]=${encodeURIComponent(id)}`
              )
              .join('&')
          : ''

      const baseQuery = `locale=${router.locale}&pagination[pageSize]=150&sort[order]=asc`
      const filterQuery = layerIdQuery ? `&${layerIdQuery}` : ''

      if (router.query.useDataLayers) {
        try {
          const response = await axios.get(
            `${strapiURL}/api/layers?${baseQuery}${filterQuery}`
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
        // Filter ValuePerCountry to the requested country only (Fix 1).
        // Some layers store entries by CountryCode, others by CountryName —
        // use $or to cover both so no entries are silently dropped.
        const countryName = router.query.country
          ? decodeURIComponent(router.query.country)
          : null
        const populateParam =
          countryCode && countryName
            ? `populate[ValuePerCountry][filters][$or][0][CountryCode][$eq]=${encodeURIComponent(countryCode)}` +
              `&populate[ValuePerCountry][filters][$or][1][CountryName][$eq]=${encodeURIComponent(countryName)}`
            : 'populate=ValuePerCountry'

        try {
          const response = await axios.get(
            `${strapiURL}/api/layers?${baseQuery}${filterQuery}&${populateParam}`
          )

          const layersNeedingFetch =
            currentLocale === 'en' ? enOnlyLayers : tradeLayers

          const toEnrich = response.data.data.filter((d) =>
            layersNeedingFetch.includes(d.attributes.arcgislayerId)
          )
          const keepAsIs = response.data.data.filter((d) =>
            !layersNeedingFetch.includes(d.attributes.arcgislayerId)
          )

          const enriched = await fetchWithConcurrency(
            toEnrich,
            fetchLayerValues,
            5
          )

          if (!cancelled) {
            setLayers([...keepAsIs, ...enriched])
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
  }, [router.locale, router.query.country, countryCode, layerIds])

  return { layers, loading }
}

export default useLayerInfo
