import { useEffect, useRef } from 'react'
import MapView from '@arcgis/core/views/MapView.js'
import ArcGISMap from '@arcgis/core/Map.js'
import styles from './index.module.scss'

// import styled from 'styled-components'

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
    if (!mapDiv.current) return

    const customBasemapLayer = new TileLayer({
      url:
        'https://geoservices.un.org/arcgis/rest/services/ClearMap_WebTopo/MapServer',
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
        viewRef.current.destroy()
        viewRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const webMap = viewRef.current?.map
    if (!webMap || layerstoset.length === 0) return

    if (currentLayerRef.current) {
      webMap.remove(currentLayerRef.current)
    }

    const newLayer = layerstoset[0]
    webMap.add(newLayer)
    currentLayerRef.current = newLayer
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

// const Container = styled.div`
//   position: relative;

//   background-color: #d3dee726;
//   flex: 1;
//   display: flex;
//   width: 100%;
//   height: 100%;

//   .esri-attribution {
//     display: none;
//   }

//   .esri-view-root {
//     z-index: 1000;
//   }
//   .esri-view {
//     position: relative;
//   }

//   .esri-popup {
//     position: absolute;
//     top: 50%;
//     left: 50%;
//     transform: translate(-50%, -50%);
//     border-radius: 8px;
//     overflow: auto;
//     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//   }

//   .esri-popup__main-container {
//     background-color: white !important;
//     padding: 16px;
//     border-radius: 8px;
//   }

//   .esri-popup__header {
//     background-color: #f0f0f0;
//     border-bottom: 1px solid #dcdcdc;
//   }

//   .esri-popup__content {
//     max-height: 300px;
//     overflow-y: auto;
//     overflow-x: hidden;
//   }
// `
