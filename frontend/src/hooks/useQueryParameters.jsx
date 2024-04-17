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

    const updatedParams = { ...currentParams, ...newParams }

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

  return {
    queryParameters: deserializeQueryParams(query),
    setQueryParameters,
  }
}

export default useQueryParameters
