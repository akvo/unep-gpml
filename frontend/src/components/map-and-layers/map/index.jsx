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

const isMobile = () => {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches ||
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ))
  )
}

const adjustPopupForMobile = (popupContainer) => {
  if (!popupContainer) return

  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight

  if (screenWidth <= 768) {
    popupContainer.style.left = `${screenWidth / 2}px`
    popupContainer.style.top = `${screenHeight / 2}px`
    popupContainer.style.transform = 'translate(-50%, -50%)'
    popupContainer.style.width = '90vw'
    popupContainer.style.maxWidth = '400px'
  }
}

const makePopupDraggable = (popupContainer, view) => {
  if (!popupContainer) return

  adjustPopupForMobile(popupContainer)

  popupContainer.style.position = 'absolute'
  popupContainer.style.cursor = 'move'
  popupContainer.style.zIndex = '300'

  let isDragging = false
  let offsetX = 0
  let offsetY = 0
  let lastPosition = { left: null, top: null }

  const onMouseDown = (event) => {
    isDragging = true
    offsetX = event.clientX - popupContainer.getBoundingClientRect().left
    offsetY = event.clientY - popupContainer.getBoundingClientRect().top
    popupContainer.style.transition = 'none'
  }

  const onMouseMove = (event) => {
    if (!isDragging) return
    const newLeft = event.clientX - offsetX
    const newTop = event.clientY - offsetY
    popupContainer.style.left = `${newLeft}px`
    popupContainer.style.top = `${newTop}px`

    lastPosition = { left: newLeft, top: newTop }
  }

  const onMouseUp = () => {
    isDragging = false
    popupContainer.style.transition = ''
  }

  view.popup.watch('visible', (isVisible) => {
    if (isVisible && lastPosition.left !== null && lastPosition.top !== null) {
      popupContainer.style.left = `${lastPosition.left}px`
      popupContainer.style.top = `${lastPosition.top}px`
    }
  })

  popupContainer.addEventListener('mousedown', onMouseDown)
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)

  return () => {
    popupContainer.removeEventListener('mousedown', onMouseDown)
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
}

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
        rotationEnabled: false,
        minZoom: 3,
        maxZoom: 18,
      },
      popup: {
        popupEnabled: true,
        dockEnabled: false,
        dockOptions: {
          buttonEnabled: false,
          breakpoint: false,
        },
      },
      ...initialViewProperties,
    })

    view.navigation = {
      browserTouchPanEnabled: true,
      mouseWheelZoomEnabled: true,
      multiTouchZoomEnabled: true,
    }

    viewRef.current = view

    let cleanupDraggable = null

    const interval = setInterval(() => {
      const popupContainer = document.querySelector('.esri-popup')
      if (popupContainer && !cleanupDraggable) {
        cleanupDraggable = makePopupDraggable(popupContainer)
        adjustPopupForMobile(popupContainer)
      } else if (!popupContainer && cleanupDraggable) {
        cleanupDraggable()
        cleanupDraggable = null
      }
    }, 1000)

    if (isMobile) {
      let lastTouchX = null
      let lastTouchY = null

      function onTouchStart(event) {
        if (event.touches.length === 1) {
          lastTouchX = event.touches[0].clientX
          lastTouchY = event.touches[0].clientY
        }
      }

      function onTouchMove(event) {
        if (
          event.touches.length === 1 &&
          lastTouchX !== null &&
          lastTouchY !== null
        ) {
          const deltaX = event.touches[0].clientX - lastTouchX
          const deltaY = event.touches[0].clientY - lastTouchY

          view.goTo({
            center: [
              view.center.longitude - deltaX * 0.01,
              view.center.latitude + deltaY * 0.01,
            ],
          })

          lastTouchX = event.touches[0].clientX
          lastTouchY = event.touches[0].clientY
          event.preventDefault()
        }
      }

      function onTouchEnd() {
        lastTouchX = null
        lastTouchY = null
      }

      view.container.addEventListener('touchstart', onTouchStart, {
        passive: false,
      })
      view.container.addEventListener('touchmove', onTouchMove, {
        passive: false,
      })
      view.container.addEventListener('touchend', onTouchEnd, {
        passive: false,
      })

      return () => {
        view.container.removeEventListener('touchstart', onTouchStart)
        view.container.removeEventListener('touchmove', onTouchMove)
        view.container.removeEventListener('touchend', onTouchEnd)
      }
    }

    return () => {
      clearInterval(interval)
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
      if (cleanupDraggable) {
        cleanupDraggable()
      }
    }
  }, [isMobile])

  useEffect(() => {
    const webMap = viewRef.current?.map
    if (!webMap || layerstoset?.length === 0) return

    const newLayer = layerstoset ? layerstoset[0] : ''
    const existingLayer = webMap.findLayerById(newLayer.id)

    if (!existingLayer) {
      if (currentLayerRef.current) {
        webMap.remove(currentLayerRef.current)
      }
      if (viewRef.current.popup.visible) {
        viewRef.current.popup.close()
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
        <Details layerId={queryParameters?.layer}></Details>
      )}
    </div>
  )
}

export default Map
