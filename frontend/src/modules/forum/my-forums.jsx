import React, { useCallback, useEffect, useState } from 'react'
import { Card, List, Modal, Popover, message } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import { useRouter } from 'next/router'
import moment from 'moment'
import Button from '../../components/button'
import api from '../../utils/api'
import styles from './forum.module.scss'
import { ChatStore, UIStore } from '../../store'
import useLocalStorage from '../../utils/hooks/use-storage'
import { Trans, t } from '@lingui/macro'

export const getMyForumsApi = async (successCallback, errorCallback) => {
  try {
    const { data: apiData } = await api.get('/chat/user/channel')
    const { channels } = apiData
    successCallback(channels)
  } catch (error) {
    errorCallback(error)
  }
}

const MyForums = ({ handleOnView }) => {
  const myForums = ChatStore.useState((s) => s.myForums)
  const initLoading = myForums.length === 0 ? true : false
  const [loading, setLoading] = useState(initLoading)
  const [openPopover, setOpenPopover] = useState(null)
  const [joins, setJoins] = useLocalStorage('joins', [])
  const profile = UIStore.useState((s) => s.profile)
  const router = useRouter()

  const requestToLeave = async (channelName, channelID, channelType) => {
    try {
      await api.post('/chat/channel/leave', {
        channel_id: channelID,
        channel_type: channelType,
      })
      /**
       * Update joins localStorage
       */
      const _joins = joins.filter((j) => j !== channelID)
      setJoins(_joins)
      message.success(`You have left the channel ${channelName}`)
      /**
       * To load the current state of localStorage,
       * we need to reload the page.
       */
      router.reload()
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
      },
      okButtonProps: {
        size: 'small',
      },
      okType: 'default',
    })
  }

  const goToChannel = ({ id: roomId }) => {
    router.push(`/forum/${roomId}`)
  }

  const getMyForums = useCallback(async () => {
    if (profile?.id && !myForums.length) {
      await getMyForumsApi(
        (data) => {
          ChatStore.update((s) => {
            s.myForums = data
          })
          setLoading(false)
        },
        () => {
          setLoading(false)
        }
      )
    }
  }, [profile, myForums])

  useEffect(() => {
    getMyForums()
  }, [getMyForums])

  if (myForums.length === 0) {
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
          grid={{ column: 3, gutter: 20, sm: 1, md: 2 }}
          dataSource={myForums}
          renderItem={(item, index) => (
            <List.Item>
              <Card>
                <div className="flex my-forums">
                  <div className="channel my-forums">
                    <span className={styles.forumType}>
                      {item?.privacy === 'private' ||
                      item?.customFields?.hasOwnProperty('psCountryIsoCodeA2')
                        ? t`private `
                        : t`public `}{' '}
                      <Trans>channel</Trans>
                    </span>
                    <h5>{item.name}</h5>
                  </div>
                  <div className="popover-container">
                    <Popover
                      placement="bottomLeft"
                      visible={openPopover === index}
                      overlayClassName={styles.forumOptions}
                      onVisibleChange={(isOpen) => {
                        const popValue = isOpen ? index : null
                        setOpenPopover(popValue)
                      }}
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
                              <Trans>View Details</Trans>
                            </Button>
                          </li>
                          <li>
                            <Button
                              type="link"
                              onClick={() => handleOnLeave(item)}
                            >
                              <Trans>Leave</Trans>
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
                    <span className="label">
                      <Trans>Last message</Trans>
                    </span>
                    <p className="p-m value" suppressHydrationWarning>
                      {moment(item?.lm).fromNow()}
                    </p>
                  </div>
                  <div>
                    <Button
                      size="small"
                      withArrow="link"
                      onClick={() => goToChannel(item)}
                    >
                      <Trans>Chat</Trans>
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
