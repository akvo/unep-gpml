import React, {useEffect} from 'react'
import Sidebar from '../../../components/map-and-layers/sidebar'
import styles from './index.module.scss'
import dynamic from 'next/dynamic'
import useLayerInfo from '../../../hooks/useLayerInfo'
import { loadCatalog } from '../../../translations/utils'
import { useRouter } from 'next/router'
import { useGlobalLayer, setGlobalLayer } from '../../../hooks/useGlobalLayer'

const DynamicMap = dynamic(
  () => import('../../../components/map-and-layers/map'),
  {
    ssr: false,
  }
)

const MapAndLayerPage = () => {
  const router = useRouter()
  const { query } = router
  const layers = useLayerInfo()
  const selectedLayer = useGlobalLayer()

    useEffect(() => {
      if (
        selectedLayer === null &&
        query?.layer &&
        layers.layers.length > 0
      ) {

        const findLayer = layers.layers.find(d => d.attributes?.arcgislayerId === query?.layer) ?? null
        console.log(findLayer)
        setGlobalLayer(findLayer)
      }
    }, [layers])

    return (
    <div className={styles.container}>
      <Sidebar alt countryDashboard={false} layers={layers.layers} />
      <DynamicMap
        initialViewProperties={{
          center: [0, 0],
          zoom: 3,
        }}
        selectedLayer={selectedLayer}
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
