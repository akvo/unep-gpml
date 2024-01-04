import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
import { isoA2 } from '../../modules/workspace/ps/config'

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

const ForumSidebar = ({
  currForum,
  activeForum,
  discussion,
  setDiscussion,
}) => {
  const router = useRouter()
  const participants = currForum?.users || activeForum?.users || []

  const goToDiscussion = (_discussion) => {
    setDiscussion(_discussion)
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
        <h5>{currForum?.name?.replace(/[-_]/g, ' ')}</h5>
        <p>{currForum?.description}</p>
      </div>
      {activeForum?.discussions?.length > 0 && (
        <>
          <h6 className="h-caps-xs w-bold">
            <Trans>Discussions</Trans>
          </h6>
          <List
            className="discussions"
            loading={!activeForum?.isFetched}
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
  const [discussion, setDiscussion] = useState(null)
  const [activeForum, setActiveForum] = useState({
    isFetched: false,
  })
  const [psFetched, setPSFetched] = useState(false)
  const router = useRouter()
  const { channelName: channelQuery, t: typeQuery } = router.query
  const [channelName, queryString] = channelQuery?.split('?') || []
  const queryParams = new URLSearchParams(queryString)
  const channelType = typeQuery || queryParams.get('t')
  const allForums = ChatStore.useState((s) => s.allForums)

  const currForum = useMemo(() => {
    return allForums.find(
      (a) => a?.name === channelName && a?.t === channelType
    )
  }, [allForums, channelName])

  const getDetailsChatApi = useCallback(async () => {
    try {
      if (!activeForum?.isFetched && currForum?.t && currForum?.id) {
        const { data } = await api.get(
          `/chat/channel/details/${currForum.id}?type=${currForum.t}`
        )
        const { users, ..._selected } = data || {}
        setActiveForum({ ...currForum, ..._selected, isFetched: true })
      }
    } catch (error) {
      setActiveForum({ ...currForum, isFetched: true })
      console.error('error details chat api:', error)
    }
  }, [activeForum, currForum])

  const goBackForum = () => {
    if (activeForum?.t && activeForum?.name) {
      goToIFrame(activeForum.t, activeForum.name)
      setDiscussion(null)
    }
  }

  const handleOnDiscussCallback = (type = 'new', evt) => {
    if (
      type === 'room-opened' &&
      evt.data.fname &&
      evt.data.fname !== evt.data.name
    ) {
      setDiscussion({ ...evt.data, id: evt.data._id })
    }
    setActiveForum({
      ...activeForum,
      isFetched: false,
    })
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
    if (
      !psFetched &&
      channelName &&
      channelName?.indexOf('plastic-strategy') != -1
    ) {
      const [_, countrySlug] = channelName?.split('plastic-strategy-')
      const countryISOA2 = isoA2?.[countrySlug]
      const { data: psData } = await api.get(
        `/plastic-strategy/${countryISOA2}`
      )
      setPSFetched(true)
      ChatStore.update((s) => {
        s.allForums = [
          ...s.allForums,
          { id: psData?.chatChannelId, name: channelName, t: 'c' },
        ]
      })
    }
  }, [allForums, channelName, psFetched])

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
          <ForumSidebar
            {...{ currForum, discussion, activeForum, setDiscussion }}
          />
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
