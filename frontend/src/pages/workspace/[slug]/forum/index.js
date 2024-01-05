import { useCallback, useEffect, useState } from 'react'
import { Skeleton } from 'antd'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import uniqBy from 'lodash/uniqBy'

import { PageLayout } from '..'
import styles from './index.module.scss'
import { loadCatalog } from '../../../../translations/utils'
import api from '../../../../utils/api'
import { isoA2 } from '../../../../modules/workspace/ps/config'
import { ChatStore } from '../../../../store'

const PREFIX_CHANNEL_NAME = 'plastic-strategy-'

const DynamicForumIframe = dynamic(
  () => import('../../../../modules/forum/forum-iframe'),
  {
    ssr: false,
  }
)

const View = ({ isAuthenticated, loadingProfile, setLoginVisible }) => {
  const router = useRouter()
  const country = router.query.slug?.replace('plastic-strategy-', '')
  const channelName = `${PREFIX_CHANNEL_NAME}${country}`
  const channelType = 'c'
  const countryISOA2 = isoA2?.[country]
  const discussion = ChatStore.useState((s) => s.discussion)

  const handleOnDiscussCallback = (type = 'new', evt) => {
    if (
      type === 'room-opened' &&
      evt.data.fname &&
      evt.data.fname !== evt.data.name
    ) {
      router.push({
        pathname: `/forum/${router.query.slug}`,
        query: { t: 'c' },
      })
      ChatStore.update((s) => {
        s.discussion = { ...evt.data, id: evt.data._id }
      })
    }
  }

  const fetchData = useCallback(async () => {
    try {
      const { data: _psData } = await api.get(
        `/plastic-strategy/${countryISOA2}`
      )
      ChatStore.update((s) => {
        s.psForums = uniqBy(
          [
            ...s.psForums,
            {
              id: _psData?.chatChannelId,
              name: router.query.slug,
              t: channelType,
              ps: true,
            },
          ],
          'id'
        )
      })
    } catch {}
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Skeleton loading={loadingProfile} active>
      <div className={styles.forumView}>
        <DynamicForumIframe
          discussionCallback={handleOnDiscussCallback}
          {...{
            channelName,
            channelType,
            isAuthenticated,
            loadingProfile,
            setLoginVisible,
            discussion,
          }}
        />
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
