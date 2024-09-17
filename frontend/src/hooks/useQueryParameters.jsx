import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const useQueryParameters = () => {
  const router = useRouter()
  const { pathname, query } = router

  const [queryParameters, setQueryParametersState] = useState({})

  useEffect(() => {
    const deserializeQueryParams = (query) => {
      const deserialized = {}
      Object.keys(query).forEach((key) => {
        try {
          deserialized[key] = JSON.parse(decodeURIComponent(query[key]))
        } catch (e) {
          deserialized[key] = decodeURIComponent(query[key])
        }
      })

      const storedLayers = sessionStorage.getItem('layers')
      if (storedLayers) {
        deserialized.layers = JSON.parse(storedLayers)
      }

      return deserialized
    }

    const initialQueryParams = deserializeQueryParams(query)
    setQueryParametersState(initialQueryParams)
  }, [query])

  const serializeQueryParams = (params) => {
    const serialized = {}
    Object.keys(params).forEach((key) => {
      if (key === 'layers') {
        sessionStorage.setItem('layers', JSON.stringify(params[key]))

        if (
          params[key].length > 0 &&
          params[key][0]?.attributes?.arcgislayerId
        ) {
          serialized.layer = encodeURIComponent(
            params[key][0].attributes.arcgislayerId
          )
        }
      } else {
        const value = params[key]
        if (typeof value === 'object') {
          serialized[key] = encodeURIComponent(JSON.stringify(value))
        } else {
          serialized[key] = encodeURIComponent(value)
        }
      }
    })

    return serialized
  }

  const setQueryParameters = (newParams, updateUrl = true) => {
    const updatedParams = { ...queryParameters, ...newParams }
    setQueryParametersState(updatedParams)

    if (updateUrl) {
      const serializedParams = serializeQueryParams(updatedParams)
      router
        .replace({ pathname, query: serializedParams }, undefined, {
          shallow: true,
        })
        .then(() => console.log('Query parameters updated.'))
        .catch((error) =>
          console.error('Failed to update query parameters:', error)
        )
    }
  }

  return {
    queryParameters,
    setQueryParameters,
  }
}

export default useQueryParameters
