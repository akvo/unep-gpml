import React, { useCallback, useEffect, useState } from 'react'
import { Card, List } from 'antd'
import styles from './index.module.scss'
import Button from '../../components/button'
import { UIStore } from '../../store'
import api from '../../utils/api'
import ForumModal from '../../modules/forum/forum-modal'
import ForumMembers from '../../modules/forum/forum-members'
import MyForums from './my-forums'

const Forum = () => {
  const [allForums, setAllForums] = useState([])
  const [viewModal, setViewModal] = useState({
    open: false,
    data: {},
  })

  const profile = UIStore.useState((s) => s.profile)

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
      }
    } catch (error) {
      console.error('err', error)
    }
  }, [profile])

  useEffect(() => {
    getAllForums()
  }, [getAllForums])

  return (
    <div className="container">
      <div className={styles.forumHome}>
        <span className="h-xs title">Forums</span>
        {profile?.id && <MyForums {...{ handleOnView }} />}

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
                    <ForumMembers
                      {...{ allForums, setAllForums, initName }}
                      forum={item}
                    />
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
        <ForumModal {...{ viewModal, setViewModal, initName }} />
      </div>
    </div>
  )
}

export default Forum
