import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Avatar, Layout, Menu, Result, Skeleton } from 'antd'
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

const ForumDetails = ({ isAuthenticated, loadingProfile, setLoginVisible }) => {
  const [preload, setPreload] = useState(true)
  const [loading, setLoading] = useState(true)
  const [publicForums, setPublicForums] = useState([])
  const router = useRouter()
  const { channelName, t: channelType } = router.query
  const myForums = ChatStore.useState((s) => s.myForums)
  const allForums = ChatStore.useState((s) => s.allForums)
  const profile = UIStore.useState((s) => s.profile)
  const channel = publicForums.find(
    (pf) => pf?.name === channelName && pf?.t === channelType
  )
  const forums = uniqBy([...myForums, ...publicForums], 'id')

  const goToChannel = ({ name, t }) => {
    router.push({
      pathname: `/forum/${name}`,
      query: {
        t,
      },
    })
  }

  const goToAll = () => {
    router.push('/forum')
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
    }
  }, [loading, isAuthenticated, loadingProfile])

  return (
    <>
      <Head>
        <title>{router.query.channelName} | UNEP GPML Digital Platform</title>
      </Head>
      <Layout>
        <Sider className={styles.channelSidebar} width={335}>
          {isAuthenticated && <h5>My Forums</h5>}
          <Skeleton loading={loading} paragraph={{ rows: 3 }} active>
            <Menu defaultSelectedKeys={[channelName]}>
              {forums.map((forum) => {
                return (
                  <Menu.Item
                    onClick={() => goToChannel(forum)}
                    icon={<DropDownIcon />}
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
        </Sider>
        <Layout className={styles.channelContent}>
          {channelName && isAuthenticated ? (
            <DynamicForumIframe
              {...{
                channelName,
                channelType,
                isAuthenticated,
                loadingProfile,
                setLoginVisible,
              }}
            />
          ) : (
            <Skeleton loading={loadingProfile} active>
              <Result
                icon={
                  <Avatar
                    alt={channel?.name}
                    size={128}
                    src={channel?.avatarUrl}
                  />
                }
                title={channel?.name}
                subTitle={channel?.description}
                extra={
                  <Button
                    withArrow="link"
                    onClick={() => setLoginVisible(true)}
                  >
                    Login to Chat
                  </Button>
                }
              />
            </Skeleton>
          )}
        </Layout>
      </Layout>
    </>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default ForumDetails
