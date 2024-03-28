import { useEffect, useState } from 'react'
import WebMap from '@arcgis/core/WebMap.js'
import useQueryParameters from './useQueryParameters'
import { isEqual } from 'lodash'

const useLoadMap = () => {
  const { queryParameters } = useQueryParameters()
  const { layers: layersFromQuery } = queryParameters

  const [renderers, setRenderers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [prevLayersFromQuery, setPrevLayersFromQuery] = useState([])

  useEffect(() => {
    let isCancelled = false

    const loadWebMapLayer = async (layer) => {
      if (layer.arcgisMapId) {
        const webMap = new WebMap({
          portalItem: {
            id: layer.arcgisMapId,
          },
        })
        console.log('layer.arcgisMapId', webMap?.layers)

        await webMap.load()
        return webMap?.layers?.getItemAt(layer.layerMappingId)?.renderer
      }
      return null
    }

    const loadWebMapLayers = async () => {
      setIsLoading(true)
      try {
        const renderersList = []
        for (const layer of layersFromQuery) {
          const loadedRenderer = await loadWebMapLayer(layer)

          if (loadedRenderer) {
            renderersList.push({ key: layer.name, renderer: loadedRenderer })
          }
        }

        setRenderers(renderersList)
      } catch (error) {
        console.error('Failed to load web map or layers', error)
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    if (!isEqual(layersFromQuery, prevLayersFromQuery)) {
      loadWebMapLayers()
      setPrevLayersFromQuery(layersFromQuery)
    }

    // Cleanup function to set isCancelled flag
    return () => {
      isCancelled = true
    }
  }, [layersFromQuery]) // Add layersFromQuery as a dependency

  console.log('renderersList1', renderers)

  // Return both the renderers list and the loading state
  return { renderers, isLoading }
}

export default useLoadMap
