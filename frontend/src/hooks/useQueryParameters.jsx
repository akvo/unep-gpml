import { useCallback } from 'react'
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

  const queryParametersStrings = convertParamsToStrings(currentQueryParams)

  const toggleLayers = (layersToToggle) => {
    let updatedLayers = [...currentQueryParams.layers]

    layersToToggle.forEach((layer) => {
      const layerIndex = updatedLayers.findIndex(
        (updatedLayer) =>
          updatedLayer.id === layer.id &&
          updatedLayer.featureId === layer.featureId
      )

      if (layerIndex > -1) {
        updatedLayers = updatedLayers.filter(
          (updatedLayer) =>
            updatedLayer.id !== layer.id &&
            updatedLayer.featureId === layer.featureId
        )
      } else {
        updatedLayers.push(layer)
      }
    })

    setQueryParameters({ ...currentQueryParams, layers: updatedLayers })
  }

  const addAnalysis = (analyses) => {
    const updatedAnalysis = [analyses]

    setQueryParameters({
      ...currentQueryParams,
      analyses: updatedAnalysis,
      detailsTab: 'analyses',
      queryLatitude: undefined,
      queryLongitude: undefined,
    })
  }

  const removeAnalysis = (title) => {
    setQueryParameters({ ...currentQueryParams, analyses: [] })
  }

  const removeTimeseriesQuery = (timeseriesQueryId) => {
    const updatedTimeseriesQueries = currentQueryParams.timeseriesQueries.filter(
      (updatedQuery) => updatedQuery.queryId !== timeseriesQueryId
    )

    setQueryParameters({
      ...currentQueryParams,
      timeseriesQueries: updatedTimeseriesQueries,
    })
  }

  const setTimeseriesQueryTab = (timeseriesQueryId, tabId) => {
    const timeseriesQueryToUpdate = currentQueryParams.timeseriesQueries.find(
      (updatedQuery) => updatedQuery.queryId === timeseriesQueryId
    )

    if (!timeseriesQueryToUpdate) return

    if (!tabId) return

    timeseriesQueryToUpdate.tabId = tabId

    const timeseriesQueryIndex = currentQueryParams.timeseriesQueries.findIndex(
      (updatedQuery) => updatedQuery.queryId === timeseriesQueryId
    )

    const updatedTimeseriesQueries = [...currentQueryParams.timeseriesQueries]

    updatedTimeseriesQueries[timeseriesQueryIndex] = timeseriesQueryToUpdate

    setQueryParameters({
      ...currentQueryParams,
      timeseriesQueries: updatedTimeseriesQueries,
    })
  }

  const getTimeseriesQueryTab = (timeseriesQueryId) => {
    const timeseriesQuery = currentQueryParams.timeseriesQueries.find(
      (updatedQuery) => updatedQuery.queryId === timeseriesQueryId
    )

    if (!timeseriesQuery) return

    return timeseriesQuery?.tabId
  }

  const setTimeseriesQuerySettings = (timeseriesQueryId, settings) => {
    const timeseriesQueryToUpdate = currentQueryParams.timeseriesQueries.find(
      (updatedQuery) => updatedQuery.queryId === timeseriesQueryId
    )

    if (!timeseriesQueryToUpdate) return

    timeseriesQueryToUpdate.settings = settings

    const timeseriesQueryIndex = currentQueryParams.timeseriesQueries.findIndex(
      (updatedQuery) => updatedQuery.queryId === timeseriesQueryId
    )

    const updatedTimeseriesQueries = [...currentQueryParams.timeseriesQueries]

    updatedTimeseriesQueries[timeseriesQueryIndex] = timeseriesQueryToUpdate

    setQueryParameters({
      ...currentQueryParams,
      timeseriesQueries: updatedTimeseriesQueries,
    })
  }

  const getTimeseriesQuerySettings = (timeseriesQueryId) => {
    const timeseriesQuery = currentQueryParams.timeseriesQueries.find(
      (updatedQuery) => updatedQuery.queryId === timeseriesQueryId
    )

    if (!timeseriesQuery) return

    return timeseriesQuery?.settings
  }

  const toggleLayer = (layer) => {
    let layersToSet = [...currentQueryParams.layers]

    const layerIndex = layersToSet.findIndex(
      (updatedLayer) => updatedLayer.id === layer.id
    )

    if (layerIndex > -1) {
      layersToSet = layersToSet.filter((updatedLayer) => {
        const isMatchingLayer = updatedLayer.id === layer.id
        const isNestedToMatchingLayer = updatedLayer.parentId === layer.id
        return !isMatchingLayer && !isNestedToMatchingLayer
      })
    } else {
      layersToSet.push(layer)
    }

    setQueryParameters({ ...currentQueryParams, layers: layersToSet })
  }

  const reorderLayers = useCallback(
    (dragIndex, hoverIndex) => {
      const previousLayers = [...currentQueryParams.layers]
      const [draggedLayer] = previousLayers.splice(dragIndex, 1)
      previousLayers.splice(hoverIndex, 0, draggedLayer)

      setQueryParameters({ layers: previousLayers })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQueryParams.layers]
  )

  const updateLayerDate = (layerToUpdate) => {
    const updatedLayers = [...currentQueryParams.layers]

    const layerIndex = updatedLayers.findIndex(
      (updatedLayer) => updatedLayer.id === layerToUpdate.id
    )

    if (layerIndex > -1) {
      updatedLayers[layerIndex] = {
        ...updatedLayers[layerIndex],
        ...(layerToUpdate.date && { date: layerToUpdate.date }),
        ...(layerToUpdate.dateMode && { dateMode: layerToUpdate.dateMode }),
        ...(layerToUpdate.year && { year: layerToUpdate.year }),
      }

      setQueryParameters({ layers: updatedLayers })
    }
  }

  const getLayerVisibility = (layerId) => {
    const layer = currentQueryParams.layers.find(
      (layerFromQuery) => layerFromQuery.id === layerId
    )

    return !!layer
  }

  return {
    queryParameters: currentQueryParams,
    queryParametersStrings,
    createQueryParametersString,
    setQueryParameters,
    toggleLayer,
    toggleLayers,
    updateLayerDate,
    reorderLayers,
    getLayerVisibility,
    addAnalysis,
    removeAnalysis,
    removeTimeseriesQuery,
    setTimeseriesQueryTab,
    getTimeseriesQueryTab,
    setTimeseriesQuerySettings,
    getTimeseriesQuerySettings,
  }
}

export default useQueryParameters
