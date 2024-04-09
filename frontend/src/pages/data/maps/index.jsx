import React from 'react'
import Sidebar from '../../../components/map-and-layers/sidebar'
import styles from './index.module.scss'
import dynamic from 'next/dynamic'

const MapAndLayerPage = () => {
  const DynamicMap = dynamic(
    () => import('../../../components/map-and-layers/map'),
    {
      ssr: false,
    }
  )

  return (
    <div className={styles.container}>
      <Sidebar alt />

      <DynamicMap
        initialViewProperties={{
          center: [0, 0],
          zoom: 1,
        }}
      />
    </div>
  )
}

export default MapAndLayerPage
