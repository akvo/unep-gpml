import { useEffect, useRef } from 'react'
import MapView from '@arcgis/core/views/MapView.js'
import ArcGISMap from '@arcgis/core/Map.js'
import styles from './index.module.scss'

import useQueryParameters from '../../../hooks/useQueryParameters'
import useLayers from '../../../hooks/useLayers'

import Details from '../details'
import useLoadMap from '../../../hooks/useLoadMap'
import Basemap from '@arcgis/core/Basemap'
import TileLayer from '@arcgis/core/layers/TileLayer.js'
const isMobile = () => {
  return window.innerWidth <= 768
}

const makePopupDraggable = (popupContainer, view) => {
  if (!popupContainer) return

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

  view.watch('popup.visible', (isVisible) => {
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

const adjustPopupPosition = (view) => {
  if (view.popup.visible && view.popup.selectedFeature) {
    const feature = view.popup.selectedFeature
    view.whenLayerView(feature.layer).then(() => {
      const screenPoint = view.toScreen(feature.geometry)
      const popupContainer = document.querySelector('.esri-popup')

      if (popupContainer) {
        let offsetX = screenPoint.x < window.innerWidth / 2 ? 120 : -280
        let offsetY = screenPoint.y < window.innerHeight / 2 ? 100 : -250

        let newLeft = screenPoint.x + offsetX
        let newTop = screenPoint.y + offsetY

        const padding = 20
        const maxLeft = window.innerWidth - popupContainer.clientWidth - padding
        const maxTop =
          window.innerHeight - popupContainer.clientHeight - padding

        if (newLeft < padding) newLeft = padding
        if (newTop < padding) newTop = padding
        if (newLeft > maxLeft) newLeft = maxLeft
        if (newTop > maxTop) newTop = maxTop

        console.log('maxTopmaxTop', popupContainer.style.top)

        popupContainer.style.left = `${newLeft}px`
        popupContainer.style.top = `${newTop}px`
      }
    })
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

    const view = isMobile()
      ? new MapView({
          container: mapDiv.current,
          map: webMap,
          constraints: {
            rotationEnabled: false,
            minZoom: 2,
            maxZoom: 18,
            extent: {
              xmin: -20037508.34,
              ymin: -20037508.34,
              xmax: 20037508.34,
              ymax: 20037508.34,
              spatialReference: { wkid: 102100 },
            },
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
      : new MapView({
          container: mapDiv.current,
          map: webMap,
          constraints: {
            minZoom: 3,
            maxZoom: 18,
          },
          popup: {
            dockEnabled: false,
            collapseEnabled: false,
          },
          ...initialViewProperties,
        })

    viewRef.current = view

    let cleanupDraggable = null

    view.when(() => {
      view.watch('popup.visible', (isVisible) => {
        if (isVisible) {
          console.log('Popup opened')
          adjustPopupPosition(view)
        }
      })

      view.on('click', async (event) => {
        const response = await view.hitTest(event)
        if (response.results.length > 0) {
          view.popup.open({
            location: event.mapPoint,
            features: [response.results[0].graphic],
          })
          setTimeout(() => adjustPopupPosition(view), 100)
        }
      })
    })

    const interval = setInterval(() => {
      const popupContainer = document.querySelector('.esri-popup')
      if (popupContainer && !cleanupDraggable) {
        cleanupDraggable = makePopupDraggable(popupContainer, view)
      } else if (!popupContainer && cleanupDraggable) {
        cleanupDraggable()
        cleanupDraggable = null
      }
    }, 1000)

    const preventDefaultGesture = (e) => e.preventDefault()

    if (isMobile()) {
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
              view.center.longitude - deltaX * 0.0005,
              view.center.latitude + deltaY * 0.0005,
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

      document.addEventListener('gesturestart', preventDefaultGesture)
      document.addEventListener('gesturechange', preventDefaultGesture)
      document.addEventListener('gestureend', preventDefaultGesture)

      return () => {
        document.removeEventListener('gesturestart', preventDefaultGesture)
        document.removeEventListener('gesturechange', preventDefaultGesture)
        document.removeEventListener('gestureend', preventDefaultGesture)
        view.container.removeEventListener('touchstart', onTouchStart)
        view.container.removeEventListener('touchmove', onTouchMove)
        view.container.removeEventListener('touchend', onTouchEnd)
      }
    }

    return () => {
      clearInterval(interval)
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }
      if (cleanupDraggable) {
        cleanupDraggable()
      }
    }
  }, [isMobile(), viewRef])

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
    <div
      className={styles.container}
      style={{ height: '100vh', minHeight: '100vh' }}
    >
      <div
        ref={mapDiv}
        style={{
          height: '100vh',
          minHeight: '100vh',
          width: '100%',
          position: 'relative',
        }}
      />
      {layerstoset && layerstoset.length > 0 && (
        <Details layerId={queryParameters?.layer} />
      )}
    </div>
  )
}

export default Map
