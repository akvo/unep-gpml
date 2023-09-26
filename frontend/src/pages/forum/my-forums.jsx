import React, { useCallback, useEffect, useState } from 'react'
import { Card, List } from 'antd'
import moment from 'moment'
import Button from '../../components/button'
import api from '../../utils/api'

const MyForums = () => {
  const [myForums, setMyForums] = useState([])
  const [loading, setLoading] = useState(true)

  const getMyForums = useCallback(async () => {
    const myDummies = [
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
    try {
      const { data } = await api.get('/chat/user/channel')
      setMyForums(data)
      setLoading(false)
    } catch {
      setMyForums(myDummies)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getMyForums()
  }, [getMyForums])
  return (
    <>
      <div className="header my-forums">
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
          loading={loading}
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
    </>
  )
}

export default MyForums
