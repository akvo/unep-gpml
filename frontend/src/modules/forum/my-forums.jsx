import React, { useCallback, useEffect, useState } from 'react'
import { Card, List, Modal, Popover, message } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import moment from 'moment'
import Button from '../../components/button'
import api from '../../utils/api'
import styles from './forum.module.scss'

const MyForums = ({ handleOnView }) => {
  const [myForums, setMyForums] = useState([])
  const [loading, setLoading] = useState(true)
  const [openPopover, setOpenPopover] = useState(null)

  const requestToLeave = async (name) => {
    await new Promise((resolve, _) => {
      setTimeout(() => resolve(), 2000)
    })
    message.success(`You have left the channel ${name}`)
    setOpenPopover(null)
  }

  const handleOnLeave = ({ name }) => {
    setOpenPopover(null)
    Modal.confirm({
      title: name,
      content: 'Are you sure you want to leave this channel?',
      onOk: () => requestToLeave(name),
      cancelButtonProps: {
        type: 'link',
        size: 'small',
        ghost: true,
      },
      okButtonProps: {
        size: 'small',
      },
      okType: 'default',
    })
  }

  const getMyForums = useCallback(async () => {
    try {
      const { data } = await api.get('/chat/user/channel')
      setMyForums(data)
      setLoading(false)
    } catch (error) {
      console.error('myforums error:', error)
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
          grid={{ column: 3, gutter: 20 }}
          dataSource={myForums}
          renderItem={(item, index) => (
            <List.Item>
              <Card>
                <div className="flex my-forums">
                  <div className="channel my-forums">
                    <span className={styles.forumType}>
                      {item.t === 'p' ? 'private ' : 'public '}channel
                    </span>
                    <h5>{item.name}</h5>
                  </div>
                  <div className="popover-container">
                    <Popover
                      placement="bottomLeft"
                      visible={openPopover === index}
                      overlayClassName={styles.forumOptions}
                      onClick={() => setOpenPopover(index)}
                      content={
                        <ul>
                          <li>
                            <Button
                              type="link"
                              onClick={() => {
                                handleOnView(item)
                                setOpenPopover(null)
                              }}
                            >
                              View Details
                            </Button>
                          </li>
                          <li>
                            <Button
                              type="link"
                              onClick={() => handleOnLeave(item)}
                            >
                              Leave
                            </Button>
                          </li>
                        </ul>
                      }
                      trigger="click"
                    >
                      <MoreOutlined rotate={90} />
                    </Popover>
                  </div>
                </div>
                <div className="flex">
                  <div className="last-message">
                    <span className="label">Last message</span>
                    <p className="p-m value" suppressHydrationWarning>
                      {moment(item.lm).fromNow()}
                    </p>
                  </div>
                  <div>
                    <Button size="small" withArrow="link">
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
