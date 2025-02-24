import React from 'react'
import Sidebar from '../../../components/map-and-layers/sidebar'
import useQueryParameters from '../../../hooks/useQueryParameters'
import styles from './index.module.scss'
import dynamic from 'next/dynamic'
import { loadCatalog } from '../../../translations/utils'

const MapAndLayerPage = () => {
  const DynamicMap = dynamic(
    () => import('../../../components/map-and-layers/map'),
    {
      ssr: false,
    }
  )
  const {
    queryParameters: { sidebar },
  } = useQueryParameters()

  return (
    <div className={styles.container}>
      <Sidebar />

      <DynamicMap
        initialViewProperties={{
          center: [0, 0],
          zoom: 1,
        }}
      />
    </div>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default MapAndLayerPage
