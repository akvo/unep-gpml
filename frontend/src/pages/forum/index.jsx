import React, { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, List } from 'antd'
import styles from './index.module.scss'
import Button from '../../components/button'
import { UIStore } from '../../store'
import api from '../../utils/api'

const Forum = () => {
  const [allForums, setAllForums] = useState([])
  const profile = UIStore.useState((s) => s.profile)

  const DynamicMyForums = dynamic(() => import('./my-forums'), {
    ssr: false,
  })

  const getAllForums = useCallback(async () => {
    try {
      /**
       * Waiting for id_token ready by checking profile state
       */
      if (profile?.id) {
        const { data } = await api.get('/chat/channel/all')
        setAllForums(data)
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
        {profile?.id && <DynamicMyForums />}

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
                    <span className="h-xs">
                      {item.t === 'p' ? 'private' : 'public'}
                    </span>
                    <h5>{item.name}</h5>
                    <p className="description">
                      {item?.description}
                    </p>
                  </div>
                  <div className="flex">
                    <div className="participants">
                      <h6 className="count">{item?.usersCount}</h6>
                      <span className="h-xxs">Participants</span>
                    </div>
                    <div>
                      {item.t === 'p' ? (
                        <Button size="small" ghost>
                          Request to Join
                        </Button>
                      ) : (
                        <Button size="small" withArrow="link">
                          View Channel
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </section>
      </div>
    </div>
  )
}

export default Forum
