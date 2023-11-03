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
  const [forums, setForums] = useState([])
  const [publicForums, setPublicForums] = useState(null)
  const [channel, setChannel] = useState(null)
  const router = useRouter()
  const { channelName, t: channelType } = router.query
  const myForums = ChatStore.useState((s) => s.myForums)
  const profile = UIStore.useState((s) => s.profile)

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
    const { data: _publicForums } = await api.get('/chat/channel/all?types=c')
    setPublicForums(_publicForums)
    const findChannel = _publicForums.find(
      (pf) => pf?.name === channelName && pf?.t === channelType
    )
    setChannel(findChannel)
  }, [channelName, channelType])

  const getMyForums = useCallback(async () => {
    /**
     * Handles direct access that allows
     * resetting the global state of my forums
     */
    if (profile?.id && preload && Array.isArray(publicForums)) {
      setPreload(false)
      try {
        const { data } = await api.get('/chat/user/channel')
        const myForums = data.filter(
          (d) => !d?.name?.includes('plastic-strategy-forum')
        ) // Exclude PS channel
        ChatStore.update((s) => {
          s.myForums = myForums
        })
        /**
         * Merged as forum list
         */
        setForums(uniqBy([...myForums, ...publicForums], 'id'))
        setLoading(false)
      } catch (error) {
        console.error('My forums error:', error)
        setLoading(false)
      }
    }
  }, [myForums, preload, loading, profile, publicForums])

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
  }, [loading, isAuthenticated, loadingProfile, channelType])

  return (
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
                  {forum.name}
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
                <Button withArrow="link" onClick={() => setLoginVisible(true)}>
                  Login to Chat
                </Button>
              }
            />
          </Skeleton>
        )}
      </Layout>
    </Layout>
  )
}

export default ForumDetails
