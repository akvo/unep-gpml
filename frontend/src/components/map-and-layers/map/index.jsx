import { useEffect, useRef } from 'react'
import MapView from '@arcgis/core/views/MapView.js'
import ArcGISMap from '@arcgis/core/Map.js'
import styles from './index.module.scss'

import useQueryParameters from '../../../hooks/useQueryParameters'
import useLayers from '../../../hooks/useLayers'

import Details from '../details'
import Card from 'antd/lib/card/Card'
import useLoadMap from '../../../hooks/useLoadMap'
import Basemap from '@arcgis/core/Basemap'
import TileLayer from '@arcgis/core/layers/TileLayer.js'

const Map = ({ initialViewProperties }) => {
  const mapDiv = useRef(null)
  const viewRef = useRef(null)
  const currentLayerRef = useRef(null)

  const { queryParameters } = useQueryParameters()
  const renderer = useLoadMap()
  const layerstoset = useLayers(renderer.renderers)

  useEffect(() => {
    if (!mapDiv.current || viewRef.current) return

    const customBasemapLayer = new TileLayer({
      url:
        'https://geoservices.un.org/arcgis/rest/services/ClearMap_WebPlain/MapServer',
    })

    const customBasemap = new Basemap({
      baseLayers: [customBasemapLayer],
      title: 'Custom Basemap',
      id: 'custom_basemap',
    })

    const webMap = new ArcGISMap({
      basemap: customBasemap,
      showAttribution: false,
      attribution: '',
    })

    const view = new MapView({
      container: mapDiv.current,
      map: webMap,
      constraints: {
        minZoom: 3,
        maxZoom: 18,
      },
      popup: {
        popupEnabled: true,
        dockEnabled: true,
        dockOptions: {
          buttonEnabled: false,
          breakpoint: false,
        },
      },
      ...initialViewProperties,
    })
    viewRef.current = view
    return () => {
      if (viewRef.current) {
        viewRef.current
          .when(() => {
            viewRef.current.destroy()
            viewRef.current = null
          })
          .catch((error) => {
            console.error('Error when closing the view:', error)
          })
      }
    }
  }, [])

  useEffect(() => {
    const webMap = viewRef.current?.map
    if (!webMap || layerstoset?.length === 0) return

    const newLayer = layerstoset ? layerstoset[0] : ''
    const existingLayer = webMap.findLayerById(newLayer.id)

    if (!existingLayer) {
      if (currentLayerRef.current) {
        webMap.remove(currentLayerRef.current)
      }
      if (viewRef.current) {
        webMap.add(newLayer)
        currentLayerRef.current = newLayer
      }
    }
  }, [layerstoset])

  return (
    <div className={styles.container}>
      <Card
        style={{
          width: '100%',
          height: '100%',
        }}
        ref={mapDiv}
      ></Card>

      {layerstoset && layerstoset.length > 0 && (
        <Details
          layerId={
            queryParameters?.layers[queryParameters.layers[0]]?.arcgislayerId
          }
        ></Details>
      )}
    </div>
  )
}

export default Map
