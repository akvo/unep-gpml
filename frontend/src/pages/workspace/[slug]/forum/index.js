import { useCallback, useEffect, useMemo } from 'react'
import { Skeleton } from 'antd'
import { useRouter } from 'next/router'
import uniqBy from 'lodash/uniqBy'

import { PageLayout } from '..'
import styles from './index.module.scss'
import { loadCatalog } from '../../../../translations/utils'
import api from '../../../../utils/api'
import { isoA2 } from '../../../../modules/workspace/ps/config'
import { ChatStore } from '../../../../store'
import DSCIframe from '../../../../components/dsc-iframe'

const View = ({ loadingProfile }) => {
  /**
   * TODO: PS Forum
   */
  const router = useRouter()
  const psSlug = router.query.slug
  const forums = ChatStore.useState((s) => s.psForums)
  const country = psSlug?.replace('plastic-strategy-', '')
  const countryISOA2 = isoA2?.[country]

  const psForum = useMemo(() => {
    return forums.find((f) => f?.slug === psSlug)
  }, [forums, psSlug])

  const fetchData = useCallback(async () => {
    try {
      if (!psForum?.roomId) {
        const { data: apiData } = await api.get(
          `/plastic-strategy/${countryISOA2}`
        )
        ChatStore.update((s) => {
          s.psForums = uniqBy(
            [
              ...s.psForums,
              {
                ...apiData,
                slug: psSlug,
                t: 'c',
              },
            ],
            'roomId'
          )
        })
      }
    } catch {}
  }, [psForum, countryISOA2, psSlug])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Skeleton loading={loadingProfile} active>
      <div className={styles.forumView}>
        {psForum?.roomId && <DSCIframe roomId={psForum.roomId} />}
      </div>
    </Skeleton>
  )
}

View.getLayout = PageLayout

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default View
