import React, { useCallback, useEffect, useState } from 'react'
import styles from './index.module.scss'
import { Card, List } from 'antd'
import moment from 'moment'
import Button from '../../components/button'
import api from '../../utils/api'

const Forum = () => {
  const [myForums, setMyForums] = useState([])

  const data = [
    {
      title: 'Issue Briefs',
      isPrivate: false,
    },
    {
      title: 'AFRIPAC',
      isPrivate: true,
    },
    {
      title: 'Data Harmonization CoP',
      isPrivate: true,
    },
    {
      title: 'LAC Forum',
      isPrivate: true,
    },
    {
      title: 'Ontology CoP',
      isPrivate: true,
    },
    {
      title: 'CoP on the Harmonization of Plastic Flow',
      isPrivate: true,
    },
    {
      title:
        'CoP to harmonize approaches for informing and enabling action on plastic pollution and marine litter',
      isPrivate: true,
    },
  ]

  const getMyForums = useCallback(async () => {
    // const res = await api.get('/chat/user/channel')
    // console.log('responsee', res)
    const dummy = [
      {
        title: 'Issue Briefs',
        isPrivate: false,
        newMessages: 11,
        lastModifiedAt: '2023-09-25T14:48:00',
      },
      {
        title: 'AFRIPAC',
        isPrivate: true,
        newMessages: 0,
        lastModifiedAt: '2023-09-11T09:48:00',
      },
      {
        title: 'Plastic Strategy South Africa',
        isPrivate: true,
        newMessages: 5,
        lastModifiedAt: '2023-09-26T09:00:00',
      },
    ]
    setMyForums(dummy)
  }, [])

  useEffect(() => {
    getMyForums()
  }, [getMyForums])
  return (
    <div className="container">
      <div className={styles.forumHome}>
        <div className="header my-forums">
          <div>
            <span className="h-xs">Forums</span>
          </div>
          <div className="jumbotron">
            <h2>My Forums</h2>
            <p className="h-xs">
              Engage in forums across a wide variety of subjects and sectors
              currently ongoing. Join the public channels or request to join the
              private channels.
            </p>
          </div>
        </div>
        <section className="my-forums">
          <List
            grid={{ column: 3 }}
            dataSource={myForums}
            renderItem={(item) => (
              <List.Item>
                <Card>
                  <div className="flex my-forums">
                    <div className="channel my-forums">
                      <span className="h-xs">
                        {item.isPrivate ? 'private' : 'public'}
                      </span>
                      <h5>{item.title}</h5>
                    </div>
                    <div className="new-messages">
                      {item.newMessages ? (
                        <>
                          <small className="label">New Messages</small>
                          <span className="h-m value">{item.newMessages}</span>
                        </>
                      ) : (
                        <small className="label empty">No New messages</small>
                      )}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="last-message">
                      <span className="label">Last message</span>
                      <p className="p-m value" suppressHydrationWarning>
                        {moment(
                          item.lastModifiedAt,
                          'YYYY-MM-DD HH:mm:dd'
                        ).fromNow()}
                      </p>
                    </div>
                    <div>
                      <Button size="small" withArrow="link" ghost>
                        Chat
                      </Button>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </section>
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
            grid={{ column: 3 }}
            dataSource={data}
            renderItem={(item) => (
              <List.Item>
                <Card>
                  <div className="channel">
                    <span className="h-xs">
                      {item.isPrivate ? 'private' : 'public'}
                    </span>
                    <h5>{item.title}</h5>
                    <p className="description">
                      Description of the forum goes here and on and on
                      describing what it is about in a sentence or two. Which
                      should be enough.
                    </p>
                  </div>
                  <div className="flex">
                    <div className="participants">
                      <h6 className="count">32</h6>
                      <span className="h-xxs">Participants</span>
                    </div>
                    <div>
                      {item.isPrivate ? (
                        <Button size="small" ghost>
                          Request to Join
                        </Button>
                      ) : (
                        <Button size="small" withArrow="link" ghost>
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
