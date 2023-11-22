import { useCallback, useEffect, useState } from 'react'
import { Trans } from '@lingui/macro'
import styles from './index.module.scss'
import api from '../../../utils/api'
import SkeletonItems from '../../../modules/workspace/ps/skeleton-items'
import { PSCard } from '../../../modules/workspace/view'
import { UIStore } from '../../../store'
import { loadCatalog } from '../../../translations/utils'

const View = () => {
  const [psAll, setPSAll] = useState([])
  const [loading, setLoading] = useState(true)
  const profile = UIStore.useState((s) => s.profile)

  const getPSAll = useCallback(async () => {
    try {
      if (profile?.id) {
        const { data: plasticsStrategies } = await api.get('/plastic-strategy')
        setPSAll(plasticsStrategies)
        setLoading(false)
      }
    } catch (error) {
      console.error('Unable to fetch plastics strategy:', error)
      setLoading(false)
    }
  }, [profile])

  useEffect(() => {
    getPSAll()
  }, [getPSAll])

  return (
    <div className={styles.psView}>
      <div className="container">
        <div className="ps-heading">
          <h2 className="h-xxl w-bold">
            <Trans>Plastic Strategies</Trans>
          </h2>
        </div>
        <SkeletonItems loading={loading} />
        <ul className="plastic-strategies-items">
          {psAll.map((item, index) => (
            <PSCard item={item} key={index} />
          ))}
        </ul>
      </div>
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

export default View
