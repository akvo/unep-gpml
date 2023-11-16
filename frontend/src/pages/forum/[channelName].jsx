import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Avatar, Layout, List, Menu, Skeleton } from 'antd'
import dynamic from 'next/dynamic'
import uniqBy from 'lodash/uniqBy'
import styles from './channel.module.scss'
import { ChatStore, UIStore } from '../../store'
import { DropDownIcon } from '../../components/icons'
import api from '../../utils/api'
import Button from '../../components/button'
import Head from 'next/head'
import { loadCatalog } from '../../translations/utils'

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

const ForumSidebar = ({ selectedForum, setSelectedForum, setDiscussion }) => {
  const goToDiscussion = (_discussion) => {
    setDiscussion(_discussion)
    goToIFrame(selectedForum?.t, _discussion?.name)
  }

  return (
    <div className={styles.detailSidebar}>
      <Button
        type="link"
        onClick={() => setSelectedForum(null)}
        icon={<DropDownIcon />}
        className={styles.backButton}
      >
        Back to all Forums
      </Button>
      <div className="description">
        <h5>{selectedForum?.name}</h5>
        <p>{selectedForum?.description}</p>
      </div>
      <strong>DISCUSSIONS</strong>
      <List
        className="discussions"
        loading={!selectedForum?.isFetched}
        dataSource={selectedForum?.discussions}
        renderItem={(item) => {
          return (
            <List.Item key={item?.name}>
              <Button onClick={() => goToDiscussion(item)} type="link">
                {`#${item?.fname}`}
              </Button>
            </List.Item>
          )
        }}
      />
      <strong>PARTICIPANTS</strong>
      <List
        className="members"
        dataSource={selectedForum?.users}
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
                title={`${firstName} ${lastName}`}
                description={user?.nickname || ''}
              />
            </List.Item>
          )
        }}
      />
    </div>
  )
}

const AllForumSidebar = ({
  channelName,
  loading,
  myForums,
  publicForums,
  onSelect,
}) => {
  const [activeKeys, setActiveKeys] = useState([channelName])
  const forums = uniqBy([...myForums, ...publicForums], 'id')
  const router = useRouter()

  const goToChannel = ({ name: forumName, t: forumType }) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/forum/${forumName}?t=${forumType}`)
    }
    setActiveKeys([forumName])
    goToIFrame(forumType, forumName)
  }

  const goToAll = () => {
    router.push('/forum')
  }

  return (
    <>
      <h5>My Forums</h5>
      <Skeleton loading={loading} paragraph={{ rows: 3 }} active>
        <Menu selectedKeys={activeKeys}>
          {forums.map((forum) => {
            return (
              <Menu.Item
                onClick={() => goToChannel(forum)}
                icon={
                  <Button type="link" onClick={() => onSelect(forum)}>
                    <DropDownIcon />
                  </Button>
                }
                key={forum.name}
              >
                {forum?.name?.replace(/[-_]/g, ' ')}
              </Menu.Item>
            )
          })}
        </Menu>
      </Skeleton>
      <div className="button-container">
        <Button onClick={goToAll} ghost>
          Explore All Forums
        </Button>
      </div>
    </>
  )
}

const ForumView = ({ isAuthenticated, loadingProfile, setLoginVisible }) => {
  const [preload, setPreload] = useState(true)
  const [loading, setLoading] = useState(true)
  const [publicForums, setPublicForums] = useState([])
  const [selectedForum, setSelectedForum] = useState(null)
  const [discussion, setDiscussion] = useState(null)
  const router = useRouter()
  const { channelName, t: channelType } = router.query
  const myForums = ChatStore.useState((s) => s.myForums)
  const allForums = ChatStore.useState((s) => s.allForums)
  const profile = UIStore.useState((s) => s.profile)

  const getSelectedForum = async (_forum) => {
    setSelectedForum({ ..._forum, isFetched: false, isError: false })
    try {
      const { data } = await api.get(
        `/chat/channel/details/${_forum?.id}?type=${_forum?.t}`
      )
      const { users, ..._selected } = data || {}
      setSelectedForum({ ..._forum, ..._selected, isFetched: true })
    } catch {
      setSelectedForum({ ..._forum, isFetched: true, isError: true })
    }
  }

  const goBackForum = () => {
    if (selectedForum?.t && selectedForum?.name) {
      goToIFrame(selectedForum.t, selectedForum.name)
      setDiscussion(null)
    }
  }

  const getPublicForums = useCallback(async () => {
    if (allForums.length && !publicForums.length) {
      /**
       * Get public forums from global state
       */
      const _publicForums = allForums.filter((forum) => forum.t === 'c')
      setPublicForums(_publicForums)
    }
    if (!allForums.length && !publicForums.length) {
      /**
       * Get public forums from API
       */
      const { data: _publicForums } = await api.get('/chat/channel/all?types=c')
      setPublicForums(_publicForums)
    }
  }, [publicForums, allForums])

  const getMyForums = useCallback(async () => {
    if (loading && myForums.length) {
      setLoading(false)
      return
    }
    /**
     * Handles direct access that allows
     * resetting the global state of my forums
     */
    if (profile?.id && preload && !myForums.length) {
      setPreload(false)
      try {
        const { data: _myForums } = await api.get('/chat/user/channel')
        ChatStore.update((s) => {
          s.myForums = _myForums
        })
        setLoading(false)
      } catch (error) {
        console.error('My forums error:', error)
        setLoading(false)
      }
    }
  }, [myForums, preload, loading, profile])

  useEffect(() => {
    getMyForums()
  }, [getMyForums])

  useEffect(() => {
    getPublicForums()
  }, [getPublicForums])

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
          {selectedForum ? (
            <ForumSidebar
              {...{ selectedForum, setSelectedForum, setDiscussion }}
            />
          ) : (
            <AllForumSidebar
              onSelect={getSelectedForum}
              {...{
                loading,
                channelName,
                myForums,
                publicForums,
              }}
            />
          )}
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
                Back to Channel
              </Button>
              <h5>{discussion?.fname}</h5>
            </div>
          )}
          {channelName && isAuthenticated && !loadingProfile && (
            <DynamicForumIframe
              {...{
                channelName,
                channelType,
                isAuthenticated,
                loadingProfile,
                setLoginVisible,
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
