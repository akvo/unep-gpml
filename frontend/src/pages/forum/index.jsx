import React, { useCallback, useEffect, useState } from 'react'
import { Card, List } from 'antd'
import dynamic from 'next/dynamic'
import styles from './index.module.scss'
import Button from '../../components/button'
import { UIStore } from '../../store'
import api from '../../utils/api'
import ForumMembers from '../../modules/forum/forum-members'
import MyForums from '../../modules/forum/my-forums'

const DynamicForumModal = dynamic(
  () => import('../../modules/forum/forum-modal'),
  {
    ssr: false, // modal has window object that should be run in client side
  }
)

const Forum = () => {
  const [allForums, setAllForums] = useState([])
  const [viewModal, setViewModal] = useState({
    open: false,
    data: {},
  })
  const [loading, setLoading] = useState(true)

  const profile = UIStore.useState((s) => s.profile)
  const avatarUrl = `${process.env.NEXT_PUBLIC_CHAT_API_DOMAIN_URL}/avatar/`

  const handleOnView = (data) => {
    setViewModal({
      open: true,
      data,
    })
  }

  const initName = (name) =>
    name
      ?.split(/[ ,]+/)
      ?.slice(0, 2)
      .map((w) => w?.slice(0, 1))

  const getAllForums = useCallback(async () => {
    try {
      /**
       * Waiting for id_token ready by checking profile state
       */
      if (profile?.id) {
        const { data } = await api.get('/chat/channel/all')
        const _allForums = data.map((d) => ({ ...d, membersFetched: false }))
        setAllForums(_allForums)
        setLoading(false)
      }
    } catch (error) {
      console.error('err', error)
      setLoading(false)
    }
  }, [profile])

  const activateRocketChat = useCallback(async () => {
    if (profile?.id && profile?.chatAccountStatus !== 'active') {
      UIStore.update((s) => {
        s.chatAccountStatus = 'active'
      })
      /**
       * TODO
       * Move UIStore update to success response
       * once the API fixed the HTTP status
       */
      try {
        const { data } = await api.post('/chat/user/account')
        console.log('RC activated', data)
      } catch (error) {
        console.log('RC activation failed:', error)
      }
    }
  }, [profile?.chatAccountStatus])

  useEffect(() => {
    activateRocketChat()
  }, [activateRocketChat])

  useEffect(() => {
    getAllForums()
  }, [getAllForums])

  return (
    <div className="container">
      <div className={styles.forumHome}>
        <span className="h-xs title">Forums</span>
        <MyForums {...{ handleOnView }} />

        <div className="header">
          <div className="jumbotron">
            <h2>All Forums</h2>
            <p className="h-xs">
              Engage in forums across a wide variety of subjects and sectors
              currently ongoing. Join the public channels or request to join the
              private channels.
            </p>
          </div>
        </div>
        <section>
          <List
            grid={{ column: 3, gutter: 20 }}
            dataSource={allForums}
            loading={loading}
            renderItem={(item) => (
              <List.Item>
                <Card>
                  <div className="channel">
                    <span className={styles.forumType}>
                      {item.t === 'p' ? 'private ' : 'public '}channel
                    </span>
                    <h5>{item.name}</h5>
                    <p className={styles.forumDesc}>{item?.description}</p>
                  </div>
                  <div className="flex">
                    <ForumMembers {...{ initName, avatarUrl }} forum={item} />
                    <div>
                      <Button
                        size="small"
                        onClick={() => handleOnView(item)}
                        ghost
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </section>
        <DynamicForumModal
          {...{ viewModal, setViewModal, initName, avatarUrl }}
        />
      </div>
    </div>
  )
}

export default Forum
