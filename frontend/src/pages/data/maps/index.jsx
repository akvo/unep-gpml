import React from 'react'
import Sidebar from '../../../components/map-and-layers/sidebar'
import styles from './index.module.scss'
import dynamic from 'next/dynamic'
import useLayerInfo from '../../../hooks/useLayerInfo'

const DynamicMap = dynamic(
  () => import('../../../components/map-and-layers/map'),
  {
    ssr: false,
  }
)

const MapAndLayerPage = () => {
  const layers = useLayerInfo()

  return (
    <div className={styles.container}>
      <Sidebar alt countryDashboard={false} layers={layers.layers} />
      <DynamicMap
        initialViewProperties={{
          center: [0, 0],
          zoom: 3,
        }}
      />
    </div>
  )
}

export default MapAndLayerPage
