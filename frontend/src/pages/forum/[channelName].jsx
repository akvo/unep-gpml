import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Layout, Menu, Skeleton } from 'antd'
import dynamic from 'next/dynamic'
import styles from './channel.module.scss'
import { ChatStore, UIStore } from '../../store'
import { DropDownIcon } from '../../components/icons'
import api from '../../utils/api'

const { Sider } = Layout
const DynamicForumIframe = dynamic(
  () => import('../../modules/forum/forum-iframe'),
  {
    ssr: false,
  }
)

const ForumDetails = () => {
  const [preload, setPreload] = useState(true)
  const [loading, setLoading] = useState(true)
  const [forums, setForums] = useState([])
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

  const getMyForums = useCallback(async () => {
    /**
     * Handles direct access that allows
     * resetting the global state of my forums
     */
    if (profile?.id && preload) {
      setPreload(false)
      const endpoints = [
        api.get('/chat/channel/all'),
        api.get('/chat/user/channel'),
      ]
      try {
        const [{ data: allForums }, { data: myForums }] = await Promise.all(
          endpoints
        )
        ChatStore.update((s) => {
          s.myForums = myForums
        })
        /**
         * Get all public forums that are not included in my forums.
         */
        const publicForums = allForums?.filter(
          (a) => a?.t === 'c' && !myForums?.map((mf) => mf?.id)?.includes(a?.id)
        )
        /**
         * Merged as forum list
         */
        setForums([...myForums, ...publicForums])
        setLoading(false)
      } catch (error) {
        console.error('My forums error:', err?.response)
        setLoading(false)
      }
    }
  }, [myForums, preload, loading, profile])

  useEffect(() => {
    getMyForums()
  }, [getMyForums])

  return (
    <Layout>
      <Sider className={styles.channelSidebar} width={335}>
        <h5>My Forums</h5>
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
        {channelName && (
          <DynamicForumIframe {...{ channelName, channelType }} />
        )}
      </Layout>
    </Layout>
  )
}

export default ForumDetails
