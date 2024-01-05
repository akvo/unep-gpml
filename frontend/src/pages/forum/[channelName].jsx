import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Avatar, Layout, List } from 'antd'
import dynamic from 'next/dynamic'
import classNames from 'classnames'

import styles from './channel.module.scss'
import { ChatStore } from '../../store'
import { DropDownIcon } from '../../components/icons'
import api from '../../utils/api'
import Button from '../../components/button'
import Head from 'next/head'
import { loadCatalog } from '../../translations/utils'
import { Trans, t } from '@lingui/macro'

const { Sider } = Layout
const DynamicForumIframe = dynamic(
  () => import('../../modules/forum/forum-iframe'),
  {
    ssr: false,
  }
)

const goToIFrame = (type, path) => {
  try {
    /**
     * Request the iframe to go to the selected channel/discussion
     */
    const prefixPATH = type === 'c' ? 'channel' : 'group'
    const iFrame = document?.querySelector('iframe')
    iFrame?.contentWindow?.postMessage(
      {
        externalCommand: 'go',
        path: `/${prefixPATH}/${path}?layout=embedded`,
      },
      '*'
    )
  } catch (error) {
    /**
     * Catch client error if any
     */
    console.error('error iframe.postMessage', error)
  }
}

const ForumSidebar = ({ activeForum, discussion }) => {
  const router = useRouter()
  const participants = activeForum?.users || []

  const goToDiscussion = (_discussion) => {
    ChatStore.update((s) => {
      s.discussion = _discussion
    })
    goToIFrame(activeForum?.t, _discussion?.name)
  }

  return (
    <div className={styles.detailSidebar}>
      <div className="description">
        <Button
          type="link"
          onClick={() => router.push('/forum')}
          icon={<DropDownIcon />}
          className={styles.backButton}
        >
          <Trans>Back to all Forums</Trans>
        </Button>
        <h5>{activeForum?.name?.replace(/[-_]/g, ' ')}</h5>
        <p>{activeForum?.description}</p>
      </div>
      {activeForum?.discussions?.length > 0 && (
        <>
          <h6 className="h-caps-xs w-bold">
            <Trans>Discussions</Trans>
          </h6>
          <List
            className="discussions"
            dataSource={activeForum?.discussions}
            renderItem={(item) => {
              const active = discussion?.id === item?.id
              return (
                <List.Item key={item?.name} className={classNames({ active })}>
                  <Button onClick={() => goToDiscussion(item)} type="link">
                    {item?.fname}
                  </Button>
                </List.Item>
              )
            }}
          />
        </>
      )}
      {participants.length > 0 && (
        <>
          <h6 className="w-bold h-caps-xs">
            <Trans>Participants</Trans>
          </h6>
          <List
            className="members"
            dataSource={participants}
            renderItem={(user) => {
              const avatarUrl = `${process.env.NEXT_PUBLIC_CHAT_API_DOMAIN_URL}/avatar/`
              const userImage = user?.avatarETag
                ? `${avatarUrl}${user?.username}?etag=${user.avatarETag}`
                : null
              const userName = user?.name || user?.username || ''
              const [firstName, lastName] = userName.split(/[ ,]+/)
              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar src={userImage}>
                        {`${firstName?.[0] || ''}${lastName?.[0] || ''}`}
                      </Avatar>
                    }
                    title={`${firstName} ${lastName || ''}`}
                    description={user?.nickname || ''}
                  />
                </List.Item>
              )
            }}
          />
        </>
      )}
    </div>
  )
}

const ForumView = ({ isAuthenticated, loadingProfile, setLoginVisible }) => {
  const [loading, setLoading] = useState(true)
  const [forumFetched, setForumFetched] = useState(false)
  const [activeForum, setActiveForum] = useState(null)
  const router = useRouter()
  const { channelName: channelQuery, t: typeQuery } = router.query
  const [channelName, queryString] = channelQuery?.split('?') || []
  const queryParams = new URLSearchParams(queryString)
  const channelType = typeQuery || queryParams.get('t')
  const allForums = ChatStore.useState((s) => s.allForums)
  const psForums = ChatStore.useState((s) => s.psForums)
  const discussion = ChatStore.useState((s) => s.discussion)

  const getDetailsChatApi = useCallback(async () => {
    const forums = [...allForums, ...psForums]
    const findForum = forums.find(
      (a) => a?.name === channelName && a?.t === channelType
    )
    if (!findForum?.id || forumFetched) {
      return
    }
    try {
      setForumFetched(true)
      const { data } = await api.get(
        `/chat/channel/details/${findForum.id}?type=${channelType}`
      )
      const { users, ..._selected } = data || {}
      setActiveForum({ ...findForum, ..._selected })
    } catch (error) {
      console.error('error details chat api:', error)
    }
  }, [activeForum, allForums, psForums, channelName, channelType, forumFetched])

  const goBackForum = () => {
    goToIFrame(channelType, channelName)
    ChatStore.update((s) => {
      s.discussion = null
    })
  }

  const handleOnDiscussCallback = (type = 'new', evt) => {
    if (
      type === 'room-opened' &&
      evt.data.fname &&
      evt.data.fname !== evt.data.name
    ) {
      ChatStore.update((s) => {
        s.discussion = { ...evt.data, id: evt.data._id }
      })
    }
  }

  const getAllForums = useCallback(async () => {
    if (!allForums.length) {
      /**
       * Get all forums API
       */
      const { data: _allForums } = await api.get('/chat/channel/all')
      ChatStore.update((s) => {
        s.allForums = _allForums
      })
    }
  }, [allForums])

  useEffect(() => {
    getAllForums()
  }, [getAllForums])

  useEffect(() => {
    getDetailsChatApi()
  }, [getDetailsChatApi])

  useEffect(() => {
    /**
     * Handle non-logged in users
     */
    if (!loadingProfile && !isAuthenticated && loading) {
      setLoading(false)
      setLoginVisible(true)
    }
  }, [loading, isAuthenticated, loadingProfile])

  return (
    <>
      <Head>
        <title>{router.query.channelName} | UNEP GPML Digital Platform</title>
      </Head>
      <Layout>
        <Sider className={styles.channelSidebar} width={335}>
          <ForumSidebar {...{ discussion, activeForum }} />
        </Sider>
        <Layout className={styles.channelContent}>
          {discussion && (
            <div className="header-discussion">
              <Button
                type="link"
                icon={<DropDownIcon />}
                className={styles.backButton}
                onClick={goBackForum}
              >
                <div className="h-caps-xs h-bold">
                  <Trans>Back to Channel</Trans>
                </div>
              </Button>
              <h3 className="h-m">{discussion?.fname}</h3>
            </div>
          )}
          {channelName && isAuthenticated && !loadingProfile && (
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
          )}
        </Layout>
      </Layout>
    </>
  )
}

export async function getStaticPaths() {
  return {
    paths: [
      // String variant:
      '/forum/general',
      // Object variant:
      { params: { channelName: 'general' } },
    ],
    fallback: true,
  }
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default ForumView
