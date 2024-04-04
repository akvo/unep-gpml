import { useRouter } from 'next/router'

const useQueryParameters = () => {
  const router = useRouter()
  const { pathname, query } = router

  const convertParamsToStrings = (params) => {
    const paramsAsStrings = {}
    for (const [key, value] of Object.entries(params)) {
      if (key === 'layers') {
        paramsAsStrings[key] = JSON.stringify(value)
      } else if (Array.isArray(value)) {
        paramsAsStrings[key] = value.join(',')
      } else if (value instanceof Date) {
        paramsAsStrings[key] = value.toISOString()
      } else {
        paramsAsStrings[key] = value.toString()
      }
    }
    return paramsAsStrings
  }

  const encodeQueryParams = (params) => {
    const jsonString = JSON.stringify(params)
    const uriEncoded = encodeURIComponent(jsonString)
    return btoa(uriEncoded)
  }

  const decodeQueryParams = (base64String) => {
    const decoded = atob(base64String)
    const uriDecoded = decodeURIComponent(decoded)
    return JSON.parse(uriDecoded)
  }

  const setQueryParameters = (newParams) => {
    const currentParams = extractQueryParameters()
    const updatedParams = { ...currentParams, ...newParams }

    const encodedParams = encodeQueryParams(updatedParams)

    router.push({
      pathname: pathname,
      query: { options: encodedParams },
    })
  }

  const extractQueryParameters = () => {
    const encodedParams = query.options

    if (encodedParams) {
      const decodedParams = decodeQueryParams(encodedParams)

      try {
        if (decodedParams.layers && typeof decodedParams.layers === 'string') {
          decodedParams.layers = JSON.parse(decodedParams.layers)
        }
      } catch (error) {
        console.error('Error parsing layers from query parameters:', error)
        decodedParams.layers = []
      }

      return decodedParams
    }

    return {
      sidebar: 'hide',
      layers: [],
      latitude: 4.941597145954475,
      longitude: 52.79204410016732,
      zoom: 5,
    }
  }

  const createQueryParametersString = (overrides = {}) => {
    const queryParamsWithOverrides = {
      ...currentQueryParams,
      ...overrides,
    }

    const encodedParams = btoa(JSON.stringify(queryParamsWithOverrides))

    return `?options=${encodedParams}`
  }

  const currentQueryParams = extractQueryParameters()

  const queryParametersStrings =
    currentQueryParams && convertParamsToStrings(currentQueryParams)

  return {
    queryParameters: currentQueryParams,
    queryParametersStrings,
    createQueryParametersString,
    setQueryParameters,
  }
}

export default useQueryParameters
