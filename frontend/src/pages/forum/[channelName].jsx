import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Layout, Menu } from 'antd'
import ForumIframe from '../../modules/forum/forum-iframe'
import styles from './channel.module.scss'
import { ChatStore, UIStore } from '../../store'
import { DropDownIcon } from '../../components/icons'
import { getMyForumsApi } from '../../modules/forum/my-forums'

const { Sider } = Layout

const ForumDetails = () => {
  const [preload, setPreload] = useState(true)
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
    if (profile?.id && preload && myForums.length === 0) {
      setPreload(false)
      await getMyForumsApi(
        (data) => {
          ChatStore.update((s) => {
            s.myForums = data
          })
        },
        (err) => {
          console.error('My forums error:', err?.response)
        }
      )
    }
  }, [myForums, preload, profile])

  useEffect(() => {
    getMyForums()
  }, [getMyForums])

  return (
    <Layout>
      <Sider className={styles.channelSidebar} width={335}>
        {myForums.length > 0 && <h5>My Forums</h5>}
        <Menu defaultSelectedKeys={[channelName]}>
          {myForums
            .filter((forum) => !forum.default)
            .map((forum) => {
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
        <div className="button-container">
          <Button onClick={goToAll} ghost>
            Explore All Forums
          </Button>
        </div>
      </Sider>
      <Layout className={styles.channelContent}>
        {channelName && <ForumIframe {...{ channelName, channelType }} />}
      </Layout>
    </Layout>
  )
}

export default ForumDetails
