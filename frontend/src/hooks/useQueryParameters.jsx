import { useRouter } from 'next/router'

const useQueryParameters = () => {
  const router = useRouter()
  const { pathname, query } = router

  const serializeQueryParams = (params) => {
    const serialized = {}
    Object.keys(params).forEach((key) => {
      const value = params[key]

      if (typeof value === 'object') {
        serialized[key] = encodeURIComponent(JSON.stringify(value))
      } else {
        serialized[key] = encodeURIComponent(value)
      }
    })
    return serialized
  }

  const deserializeQueryParams = (query) => {
    const deserialized = {}
    Object.keys(query).forEach((key) => {
      try {
        deserialized[key] = JSON.parse(decodeURIComponent(query[key]))
      } catch (e) {
        deserialized[key] = decodeURIComponent(query[key])
      }
    })
    return deserialized
  }

  const setQueryParameters = (newParams) => {
    const currentParams = deserializeQueryParams(query)

    Object.keys(currentParams).forEach((key) => {
      if (newParams[key] === undefined) {
        delete currentParams[key]
      }
    })

    const updatedParams = {
      ...currentParams,
      ...newParams,
      ...serializeQueryParams(newParams),
    }

    router
      .replace({ pathname, query: updatedParams }, undefined, { shallow: true })
      .then(() =>
        console.log('Complete.')
      )
      .catch((error) => console.error('Failed:', error))
  }

  const queryParameters = deserializeQueryParams(query)

  return {
    queryParameters,
    setQueryParameters,
  }
}

export default useQueryParameters
