import { useState } from 'react'
import { Skeleton } from 'antd'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { PageLayout } from '..'
import styles from './index.module.scss'
import { loadCatalog } from '../../../../translations/utils'

const PREFIX_CHANNEL_NAME = 'plastic-strategy-'

const DynamicForumIframe = dynamic(
  () => import('../../../../modules/forum/forum-iframe'),
  {
    ssr: false,
  }
)

const View = ({ isAuthenticated, loadingProfile, setLoginVisible }) => {
  const [discussion, setDiscussion] = useState(null)
  const router = useRouter()
  const country = router.query.slug?.replace('plastic-strategy-', '')
  const channelName = `${PREFIX_CHANNEL_NAME}${country}`
  const channelType = 'c'

  const handleOnDiscussCallback = (type = 'new', evt) => {
    if (
      type === 'room-opened' &&
      evt.data.fname &&
      evt.data.fname !== evt.data.name
    ) {
      setDiscussion({ ...evt.data, id: evt.data._id })
    }
  }

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
