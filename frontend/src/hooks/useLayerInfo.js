import axios from 'axios'
import { useEffect, useState } from 'react'
import { getStrapiUrl } from '../utils/misc'
import { useRouter } from 'next/router'

const useLayerInfo = () => {
  const [layers, setLayers] = useState([])
  const [loading, setLoading] = useState(true)
  const strapiURL = getStrapiUrl()
  const router = useRouter()

  useEffect(() => {
    const fetchLayers = async () => {
      const currentLocale = router.locale
      if (router.query.useDataLayers) {
        try {
          const response = await axios.get(
            `${strapiURL}/api/layers?locale=${router.locale}&pagination[pageSize]=150&sort[order]=asc`
          )

          const updateLayer = await Promise.all(
            response.data.data.map(async (d) => {
              try {
                const getValues = await axios.get(
                  `${strapiURL}/api/data-layers?filters[argislayerid]=${d.attributes.arcgislayerId}&pagination[page]=1&pagination[pageSize]=2000&publicationState=preview`
                )

                return {
                  ...d,
                  attributes: {
                    ...d.attributes,
                    ValuePerCountry: getValues.data.data.map((v) => v.attributes) ?? []
                  },
                }
              } catch (valueError) {
                console.error(
                  `Error fetching values for layer ${d.attributes.arcgislayerId}:`,
                  valueError
                )
                return d
              }
            })
          ).catch((err) => {
            console.error('Error in Promise.all:', err)
            return response.data.data
          })

          setLayers(updateLayer || response.data.data || [])
          setLoading(false)
        } catch (error) {
          console.error('Error fetching Layers:', error)
          setLayers([]) // Set empty array instead of leaving previous state
          setLoading(false)
        }
      } else {
        try {
          const response = await axios.get(
            `${strapiURL}/api/layers?locale=${router.locale}&pagination[pageSize]=150&sort[order]=asc&populate=ValuePerCountry`
          )

          const updateLayer = await Promise.all(
            response.data.data.map(async (d) => {
              if (
                (d.attributes.arcgislayerId ===
                  'Final_manufactured_plastic_goods___value__export__V2_WFL1' ||
                  d.attributes.arcgislayerId ===
                    'Total_plastic___value__export__V2_WFL1' ||
                  d.attributes.arcgislayerId ===
                    'Plastic_waste_weigth____export__WFL1') &&
                currentLocale === 'en'
              ) {
                try {
                  const getValues = await axios.get(
                    `${strapiURL}/api/data-layers?filters[argislayerid]=${d.attributes.arcgislayerId}&pagination[page]=1&pagination[pageSize]=2000&publicationState=preview`
                  )

                  return {
                    ...d,
                    attributes: {
                      ...d.attributes,
                      ValuePerCountry:
                        getValues?.data?.data.map((v) => v.attributes) || [],
                    },
                  }
                } catch (valueError) {
                  console.error(
                    `Error fetching values for layer ${d.attributes.arcgislayerId}:`,
                    valueError
                  )
                  return d
                }
              }
              return d
            })
          ).catch((err) => {
            console.error('Error in Promise.all:', err)
            return response.data.data
          })

          setLayers(updateLayer || response.data.data || [])
          setLoading(false)
        } catch (error) {
          console.error('Error fetching Layers:', error)
          setLayers([]) // Set empty array instead of leaving previous state
          setLoading(false)
        }
      }
    }

    fetchLayers()
  }, [router.locale])

  return { layers, loading }
}

export default useLayerInfo
