import React, { useCallback, useEffect, useState } from 'react'
import { Card, List, Modal, Popover, message } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import moment from 'moment'
import Button from '../../components/button'
import api from '../../utils/api'
import styles from './forum.module.scss'
import { UIStore } from '../../store'

const MyForums = ({ allForums, setAllForums, handleOnView }) => {
  const [myForums, setMyForums] = useState([])
  const [loading, setLoading] = useState(true)
  const [isTagged, setIsTagged] = useState(true)
  const [openPopover, setOpenPopover] = useState(null)
  const profile = UIStore.useState((s) => s.profile)

  const requestToLeave = async (channelName, channelID, channelType) => {
    try {
      await api.post('/chat/channel/leave', {
        channel_id: channelID,
        channel_type: channelType,
      })
      const _myForums = myForums.filter((mf) => mf.id !== channelID)
      setMyForums(_myForums)
      message.success(`You have left the channel ${channelName}`)
    } catch (error) {
      console.error(`leave channel error: ${error}`)
      message.error(
        `Error: Unable to leave channel ${channelName}. Please try again later.`
      )
    }
  }

  const handleOnLeave = ({ name, id, t }) => {
    setOpenPopover(null)
    Modal.confirm({
      title: name,
      content: 'Are you sure you want to leave this channel?',
      onOk: () => requestToLeave(name, id, t),
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

  useEffect(() => {
    /**
     * Add joined property to tag my forum in all items
     */
    if (myForums?.length && allForums?.length) {
      setIsTagged(false)
      const _allForums = allForums.map((a) => {
        const findMyChannel = myForums.find((mf) => mf?.id === a?.id)
        if (findMyChannel) {
          return {
            ...a,
            joined: true,
          }
        }
        return a
      })
      setAllForums(_allForums)
    }
  }, [isTagged, allForums, myForums])

  const getMyForums = useCallback(async () => {
    try {
      if (profile?.id) {
        const { data } = await api.get('/chat/user/channel')
        setMyForums(data)
        setLoading(false)
      }
    } catch (error) {
      console.error('myforums error:', error)
      setLoading(false)
    }
  }, [profile])

  useEffect(() => {
    getMyForums()
  }, [getMyForums])

  if (!loading && myForums.length === 0) {
    return null
  }

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
