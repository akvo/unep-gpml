import React, { useCallback, useEffect, useState, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Button,
  Layout,
  List,
  Avatar,
  Popover,
  Modal,
  Form,
  Input,
  notification,
  AutoComplete,
  Radio,
} from 'antd'
import { Trans } from '@lingui/macro'
import classNames from 'classnames'
// import { deepClone } from 'lodash'
import debounce from 'lodash/debounce'

import styles from './index.module.scss'
import {
  DropDownIcon,
  PinCalendar,
  PinDoc,
  PinForm,
  PinPdf,
  PinVideo,
} from '../../../components/icons'
import api from '../../../utils/api'
import { MoreOutlined } from '@ant-design/icons'
import { loadCatalog } from '../../../translations/utils'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import { UIStore } from '../../../store'
import useNotifications from '../../../hooks/useNotifications'
import ChatSvg from '../../../images/chat.svg'

const DynamicForumModal = dynamic(
  () => import('../../../modules/forum/forum-modal'),
  {
    ssr: false,
  }
)

const ForumView = ({
  isAuthenticated,
  setLoginVisible,
  profile,
  setShouldLoginClose,
  loadingProfile,
  setShouldJoin,
}) => {
  const router = useRouter()
  const [activeForum, setActiveForum] = useState(null)
  const [sdk, setSDK] = useState(null)
  const [discussion, setDiscussion] = useState(null)
  const [userJoined, setUserJoined] = useState(false)
  const [conversationToOpen, setConversationToOpen] = useState(null)

  const [viewModal, setViewModal] = useState({
    open: false,
    data: {},
  })

  const { notifications } = UIStore.useState((s) => ({
    notifications: s.notifications || [],
  }))

  const { chatAccountAuthToken: accessToken } = profile || {}

  const { markNotificationsAsRead } = useNotifications(isAuthenticated)

  const iframeURL = useMemo(() => {
    if (!router.query?.params?.[0]) {
      return null
    }
    return `${process.env.NEXT_PUBLIC_DSC_URL}/${router.query.params?.[0]}?accessToken=${accessToken}`
  }, [router.query?.params?.[0], accessToken])

  const fetchData = useCallback(async () => {
    try {
      if (profile?.id && isAuthenticated && router.query?.params?.[0]) {
        const { data: apiData } = await api.get(
          `/chat/channel/details/${router.query.params?.[0]}`
        )
        const { channel: _activeForum } = apiData || {}
        setUserJoined(
          _activeForum.users.findIndex((it) => it.id === profile.id) !== -1
        )
        setActiveForum(_activeForum)
        await markNotificationsAsRead(router.query.params?.[0], 'channel')
      }
    } catch (error) {
      console.error(error)
    }
  }, [isAuthenticated, profile, router.query?.params?.[0]])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!loadingProfile && !isAuthenticated) {
      setShouldLoginClose(true)
      setLoginVisible(true)
    }
  }, [isAuthenticated, loadingProfile])

  useEffect(() => {
    if (!userJoined && activeForum) {
      setViewModal({
        open: true,
        data: { ...activeForum },
      })
    }
  }, [userJoined])

  const handleSDKLoaded = async () => {
    if (window?.DSChatSDK && !sdk) {
      const _sdk = new window.DSChatSDK(
        router.query.params?.[0],
        'chat-frame',
        process.env.NEXT_PUBLIC_DSC_PUBLIC_KEY
      )
      // Call the connect method to connect the SDK to the Chat iFrame.
      await _sdk.connect()

      setSDK(_sdk)
    }
  }
  useEffect(() => {
    handleSDKLoaded()
  }, [activeForum, sdk])

  useEffect(() => {
    if (router.query.conversation) {
      setConversationToOpen(router.query.conversation)
    }
  }, [router.query.conversation])

  useEffect(() => {
    if (sdk && activeForum && conversationToOpen) {
      setTimeout(() => {
        sdk.openConversation(conversationToOpen)
      }, 3000)
      setConversationToOpen(null)
      markNotificationsAsRead(
        activeForum.id,
        'conversation',
        conversationToOpen
      )
    }
  }, [sdk, activeForum, conversationToOpen, markNotificationsAsRead])

  useEffect(() => {
    if (sdk != null) {
      sdk.loadCustomization({
        hideSidebar: true,
        hideHeader: true,
        hideChatInputTextArea: !userJoined || !isAuthenticated,
      })
    }
  }, [sdk, userJoined, isAuthenticated])

  const handleClickJoin = () => {
    api.post('/chat/channel/public', { channelId: activeForum.id })
    setUserJoined(true)
  }
  const handleClickLeave = () => {
    api.post('/chat/channel/leave', { channelId: activeForum.id })
    setUserJoined(false)
  }
  const isAdmin = profile?.role === 'ADMIN'
  const channelId = activeForum?.id

  const { psview } = router.query
  return (
    <>
      <Script
        src="https://cdn.deadsimplechat.com/sdk/1.2.1/dschatsdk.min.js"
        onReady={handleSDKLoaded}
      />
      <div className={styles.view}>
        <div className={styles.container}>
          <div className={classNames('sidebar', { psview })}>
            {!psview && (
              <div className="description">
                <Button
                  type="link"
                  onClick={() => router.push('/forum')}
                  icon={<DropDownIcon />}
                  className={styles.backButton}
                >
                  <Trans>Back to all Forums</Trans>
                </Button>
                <div className="title-container">
                  <h5>{activeForum?.name}</h5>
                  {userJoined && (
                    <div className="popover-container">
                      <Popover
                        placement="bottomLeft"
                        overlayClassName={styles.forumOptions}
                        content={
                          <ul>
                            <li>
                              <Button
                                size="small"
                                type="link"
                                onClick={handleClickLeave}
                              >
                                <Trans>Leave Channel</Trans>
                              </Button>
                            </li>
                          </ul>
                        }
                        trigger="click"
                      >
                        <MoreOutlined rotate={90} />
                      </Popover>
                    </div>
                  )}
                </div>
                <p>{activeForum?.description}</p>
              </div>
            )}
            <PinnedLinks {...{ isAdmin, channelId }} />

            {/* {activeForum != null && (
              <Discussions
                discussions={activeForum.discussions}
                channelId={router.query.params?.[0]}
                subchannelId={router.query.params?.[1]}
                {...{
                  discussion,
                  setDiscussion,
                  sdk,
                  profile,
                  setActiveForum,
                  markNotificationsAsRead,
                }}
              />
            )} */}
            {activeForum?.users?.length > 0 && (
              <Participants
                {...{
                  isAdmin,
                  activeForum,
                  channelId,
                  sdk,
                  profile,
                  markNotificationsAsRead,
                }}
              />
            )}
          </div>

          <Layout className={classNames('content', { psview })}>
            {discussion && (
              <div className="header-discussion">
                <Button
                  type="link"
                  icon={<DropDownIcon />}
                  className={styles.backButton}
                  onClick={() => {
                    setDiscussion(null)
                    sdk?.selectChannel('main')
                  }}
                >
                  <div className="h-caps-xs h-bold">
                    <Trans>Back to Channel</Trans>
                  </div>
                </Button>
                <h3 className="h-m">{discussion?.name}</h3>
              </div>
            )}
            {iframeURL && (
              <iframe
                id="chat-frame"
                src={iframeURL}
                width="100%"
                className={classNames({
                  discussion,
                  joined: userJoined && activeForum != null,
                })}
              />
            )}
            {!userJoined && activeForum !== null && (
              <div className="join-container">
                <Button
                  type="primary"
                  className="noicon"
                  onClick={handleClickJoin}
                >
                  Join Channel
                </Button>
              </div>
            )}
          </Layout>
          <DynamicForumModal
            {...{
              viewModal,
              setViewModal,
              setLoginVisible,
              isAuthenticated,
              profile,
              setShouldJoin,
            }}
          />
          {/* </div> */}
        </div>
      </div>
    </>
  )
}

const PinnedLinks = ({ isAdmin, channelId }) => {
  const initialState = {
    title: '',
    url: '',
    type: null,
  }
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ ...initialState })
  const [showModal, setShowModal] = useState({ open: false, mode: null })
  const [sending, setSending] = useState(false)
  const handleOnChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
  }
  const handleSubmit = () => {
    setSending(true)
    api.post(`/chat/admin/channel/${channelId}/pinned-link`, form).then((d) => {
      setItems((_items) => {
        return [..._items, d.data.pinnedLink]
      })
      setSending(false)
      setShowModal({ open: false, mode: null })
      setForm(initialState)
    })
  }
  const handleDelete = (item) => () => {
    api.delete(`/chat/admin/channel/${channelId}/pinned-link/${item.id}`)
    setItems((_items) => {
      return _items.filter((it) => it.id !== item.id)
    })
  }
  useEffect(() => {
    if (channelId != null)
      api.get(`/chat/channel/pinned-link/${channelId}`).then((d) => {
        setItems(d.data.pinnedLinks)
      })
  }, [channelId])
  const type2iconMap = {
    video: PinVideo,
    pdf: PinPdf,
    form: PinForm,
    doc: PinDoc,
    calendar: PinCalendar,
  }
  if (items.length === 0 && !isAdmin) return
  return (
    <>
      <div className="attachment-cols">
        <div className="col">
          <h6 className="w-bold h-caps-xs">
            <Trans>Shared Documents</Trans>
          </h6>
          {/* <div className="mobile-scroller-horiz"> */}
          <ul className="pinned-links">
            {items
              .filter((item) => item.type !== 'calendar')
              .map((item) => {
                const Icon = type2iconMap[item.type]
                return (
                  <li key={item.id}>
                    <a href={item.url} target="_blank">
                      <div className="icon">
                        <Icon />
                      </div>
                      <span>{item.title}</span>
                    </a>
                    {isAdmin && (
                      <div className="popover-container">
                        <Popover
                          placement="bottomLeft"
                          overlayClassName={styles.forumOptions}
                          content={
                            <ul>
                              <li>
                                <Button
                                  size="small"
                                  type="link"
                                  onClick={handleDelete(item)}
                                >
                                  <Trans>Delete</Trans>
                                </Button>
                              </li>
                            </ul>
                          }
                          trigger="click"
                        >
                          <MoreOutlined rotate={90} />
                        </Popover>
                      </div>
                    )}
                  </li>
                )
              })}

            {isAdmin && (
              <li className="add-new-topic hide-mobile">
                <Button
                  type="link"
                  className="caps-btn"
                  size="small"
                  onClick={() => {
                    setForm({ ...initialState })
                    setShowModal({ open: true, mode: 'doc' })
                  }}
                >
                  + Add New Document Link
                </Button>
              </li>
            )}
          </ul>
        </div>
        <div className="col">
          <h6 className="w-bold h-caps-xs">
            <Trans>Meetings</Trans>
          </h6>
          <ul className="pinned-links">
            {items
              .filter((item) => item.type === 'calendar')
              .map((item) => {
                const Icon = type2iconMap[item.type]
                return (
                  <li key={item.id}>
                    <a href={item.url} target="_blank">
                      <div className="icon">
                        <Icon />
                      </div>
                      <span>{item.title}</span>
                    </a>
                    {isAdmin && (
                      <div className="popover-container">
                        <Popover
                          placement="bottomLeft"
                          overlayClassName={styles.forumOptions}
                          content={
                            <ul>
                              <li>
                                <Button
                                  size="small"
                                  type="link"
                                  onClick={handleDelete(item)}
                                >
                                  <Trans>Delete</Trans>
                                </Button>
                              </li>
                            </ul>
                          }
                          trigger="click"
                        >
                          <MoreOutlined rotate={90} />
                        </Popover>
                      </div>
                    )}
                  </li>
                )
              })}

            {isAdmin && (
              <li className="add-new-topic hide-mobile">
                <Button
                  type="link"
                  className="caps-btn"
                  size="small"
                  onClick={() => {
                    setForm({ ...initialState, type: 'calendar' })
                    setShowModal({ open: true, mode: 'meeting' })
                  }}
                >
                  + Add New Meeting
                </Button>
              </li>
            )}
          </ul>
        </div>
      </div>
      {/* </div> */}
      <Modal
        visible={showModal.open}
        onCancel={() => {
          setShowModal({ open: false, mode: null })
        }}
        footer={null}
        title={
          showModal.mode === 'meeting'
            ? 'Add New Meeting'
            : 'Add New Pinned Document'
        }
        className={styles.addPinnedModal}
      >
        <div>
          <Form layout="vertical">
            <Form.Item label="Title">
              <Input value={form.title} onChange={handleOnChange('title')} />
            </Form.Item>
            <Form.Item label="URL">
              <Input value={form.url} onChange={handleOnChange('url')} />
            </Form.Item>
            {showModal.mode !== 'meeting' && (
              <Form.Item label="Type">
                <Radio.Group
                  buttonStyle="solid"
                  value={form.type}
                  onChange={handleOnChange('type')}
                >
                  <Radio.Button value="video">
                    <div className="icon">
                      <PinVideo />
                    </div>
                    Video
                  </Radio.Button>
                  <Radio.Button value="pdf">
                    <div className="icon">
                      <PinPdf />
                    </div>
                    PDF
                  </Radio.Button>
                  <Radio.Button value="doc">
                    <div className="icon">
                      <PinDoc />
                    </div>
                    Doc
                  </Radio.Button>
                  <Radio.Button value="form">
                    <div className="icon">
                      <PinForm />
                    </div>
                    Form
                  </Radio.Button>
                  {/* <Radio.Button value="event">
                    <div className="icon">
                      <PinCalendar />
                    </div>
                    Invite
                  </Radio.Button> */}
                </Radio.Group>
              </Form.Item>
            )}
            <hr />
            <div>
              <Button
                type="primary"
                className="noicon"
                onClick={handleSubmit}
                loading={sending}
              >
                {showModal.mode === 'meeting'
                  ? 'Add New Meeting'
                  : 'Add New Pinned Document'}
              </Button>
              <Button
                type="ghost"
                className="noborder"
                onClick={() => {
                  setShowModal({ open: false, mode: null })
                }}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  )
}

const Participants = ({
  isAdmin,
  activeForum,
  channelId,
  sdk,
  profile,
  markNotificationsAsRead,
}) => {
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserLabel, setSelectedUserLabel] = useState('')
  const { rawNotifications } = useNotifications(true)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post(
        `/chat/admin/channel/${channelId}/add-user/${selectedUser}`
      )
      notification.success({ message: 'User added to channel' })
    } catch (error) {
      notification.error({
        message: error.response.data
          ? error.response.data.reason
          : 'An error occured',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = debounce((value) => {
    if (value && value.length >= 3) {
      api
        .get(`/community?q=${value}&networkType=stakeholder`)
        .then((newOptions) => {
          setOptions(newOptions.data.results)
        })
    } else {
      setOptions([])
    }
  }, 300)

  const handleSelect = (value, option) => {
    setSelectedUser(value)
    setSelectedUserLabel(option.label)
  }

  const getUserNotificationCount = (otherUserChatId, otherUserId) => {
    if (
      !rawNotifications ||
      !otherUserChatId ||
      !activeForum?.conversations ||
      otherUserId === profile.id
    )
      return 0

    const userConversationIds = activeForum.conversations
      .filter(
        (c) =>
          c.memberOne?.id === otherUserChatId ||
          c.memberTwo?.id === otherUserChatId
      )
      .map((c) => c.conversationId)

    if (userConversationIds.length === 0) return 0

    const userNotifications = rawNotifications.filter(
      (notification) =>
        notification['subType'] === 'conversation' &&
        userConversationIds.includes(notification['subContextId']) &&
        notification.status === 'unread'
    )

    const totalCount = userNotifications.reduce(
      (sum, n) => sum + (n.content?.length || 0),
      0
    )

    return totalCount
  }

  const handleParticipantClick = async (user) => {
    if (sdk && user?.id && user.id !== profile.id) {
      const count = getUserNotificationCount(user.chatUserId, user.id)
      if (count > 0) {
        const userConversationIds = activeForum.conversations
          .filter(
            (c) =>
              c.memberOne?.id === user.chatUserId ||
              c.memberTwo?.id === user.chatUserId
          )
          .map((c) => c.conversationId)

        for (const conversationId of userConversationIds) {
          await markNotificationsAsRead(
            channelId,
            'conversation',
            conversationId
          )
        }
      }
      sdk.createConversation(user.chatUserId)
    }
  }

  return (
    <>
      <h6 className="w-bold h-caps-xs">
        <Trans>Participants</Trans>
      </h6>
      <div className="mobile-scroller-horiz">
        <List
          className="members"
          dataSource={activeForum.users}
          renderItem={(user) => {
            const fullName = `${user?.firstName} ${user?.lastName || ''}`
            const notificationCount = getUserNotificationCount(
              user.chatUserId,
              user.id
            )
            return (
              <List.Item
                style={{
                  cursor: user.id !== profile.id ? 'pointer' : 'default',
                }}
                className={user.id !== profile.id ? '' : 'self'}
                onClick={() => handleParticipantClick(user)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar src={user?.picture}>
                      {fullName
                        .split(' ')
                        .map((it) => it[0])
                        .join('')}
                    </Avatar>
                  }
                  title={fullName}
                  description={user?.org?.name}
                />
                {user.id !== profile.id && notificationCount > 0 ? (
                  <span className="notifcation-badge">{notificationCount}</span>
                ) : user.id !== profile.id ? (
                  <span className="chat-icon">
                    <ChatSvg />
                  </span>
                ) : null}
              </List.Item>
            )
          }}
        />
        {isAdmin && (
          <div className="add-user hide-mobile">
            <Button
              type="link"
              className="caps-btn"
              size="small"
              onClick={() => {
                setShowAddUserModal(true)
              }}
            >
              + Add User to Channel
            </Button>
          </div>
        )}
      </div>
      <Modal
        visible={showAddUserModal}
        onCancel={() => setShowAddUserModal(false)}
        footer={null}
        title="Add User to Channel"
        className="add-user-modal"
      >
        <Form layout="vertical">
          <Form.Item>
            <AutoComplete
              placeholder="Find in GPML users..."
              onSearch={handleSearch}
              options={options.map((user) => ({
                value: user.id,
                id: user.id,
                label: user.name,
              }))}
              onSelect={handleSelect}
              value={selectedUserLabel}
              onChange={setSelectedUserLabel}
            />
          </Form.Item>
          <Button onClick={handleSubmit} disabled={loading} loading={loading}>
            Add User
          </Button>
        </Form>
      </Modal>
    </>
  )
}

const Discussions = ({
  discussion,
  setDiscussion,
  sdk,
  channelId,
  subchannelId,
  profile,
  setActiveForum,
  markNotificationsAsRead,
}) => {
  const [showAddDiscussionModal, setShowAddDiscussionModal] = useState(false)
  const [newDiscussionName, setNewDiscussionName] = useState('')
  const [creating, setCreating] = useState(false)
  const [discussions, setDiscussions] = useState([])
  const isAdmin = profile?.role === 'ADMIN'

  const handleCreateDiscussion = () => {
    setCreating(true)
    api
      .post(`/chat/channel/create-discussion/${channelId}`, {
        name: newDiscussionName,
      })
      .then((d) => {
        setCreating(false)
        setShowAddDiscussionModal(false)
        setNewDiscussionName('')
        setDiscussions([...discussions, d.data.discussion])
      })
      .catch((d) => {
        console.log(d)
        notification.warning('Error occured')
        setCreating(false)
      })
  }
  const handleDeleteDiscussion = (discuss) => () => {
    api
      .delete(
        `/chat/channel/delete-discussion/${channelId}/discussion/${discuss.id}`
      )
      .then(() => {
        setDiscussions((_discussions) => {
          return _discussions.filter((it) => it.id !== discuss.id)
        })
      })
  }
  useEffect(() => {
    if (subchannelId != null) {
      sdk?.selectChannel(subchannelId)
    }
    api.get(`/chat/channel/discussions/${channelId}`).then((d) => {
      setDiscussions(d.data.discussions)
      if (subchannelId != null) {
        const item = d.data.discussions.find((it) => it.id === subchannelId)
        setDiscussion(item)
        setTimeout(() => {
          sdk?.selectChannel(subchannelId)
        }, 500)
      }
    })
    // if (sdk) {
    // const { channels } = await _sdk.getActiveChannels()
    // console.log(channels)
    // setActiveForum({
    //   ...activeForum,
    //   discussions: channels.map((c) => ({ ...c, name: c.channelName })),
    // })
    // }
  }, [])

  if (discussions?.length === 0 && !isAdmin) return
  return (
    <>
      <h6 className="h-caps-xs w-bold">
        <Trans>Discussions</Trans>
      </h6>
      <div className="mobile-scroller-horiz">
        <ul className="discussions">
          {discussions?.map((discuss, dx) => (
            <DiscussionItem
              {...{
                discuss,
                dx,
                sdk,
                isAdmin,
                handleDeleteDiscussion,
                setDiscussion,
                discussion,
                setDiscussions,
                markNotificationsAsRead,
              }}
            />
          ))}
          {isAdmin && (
            <li className="add-new-topic hide-mobile">
              <Button
                type="link"
                className="caps-btn"
                size="small"
                onClick={() => {
                  setShowAddDiscussionModal(true)
                }}
              >
                + Add New Discussion Topic
              </Button>
            </li>
          )}
        </ul>
      </div>
      <Modal
        visible={showAddDiscussionModal}
        onCancel={() => {
          setShowAddDiscussionModal(false)
        }}
        footer={null}
        title="Add New Discussion Topic"
      >
        <div>
          <Form layout="vertical">
            <Form.Item>
              <Input
                placeholder="Name your discussion"
                value={newDiscussionName}
                onChange={(e) => {
                  setNewDiscussionName(e.target.value)
                }}
                disabled={creating}
              />
            </Form.Item>
            <div>
              <Button
                type="primary"
                className="noicon"
                onClick={handleCreateDiscussion}
                loading={creating}
              >
                Create Discussion
              </Button>
              <Button
                type="ghost"
                className="noborder"
                onClick={() => {
                  setShowAddDiscussionModal(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  )
}

const DiscussionItem = ({
  discussion,
  dx,
  sdk,
  discuss,
  isAdmin,
  handleDeleteDiscussion,
  setDiscussion,
  markNotificationsAsRead,
}) => {
  const { rawNotifications } = useNotifications(true)

  const getNotificationCount = () => {
    if (!rawNotifications || !discuss?.id) return 0

    const matchingNotifications = rawNotifications.filter(
      (notification) =>
        notification['subContextId'] === discuss.id &&
        notification.status === 'unread'
    )

    const totalCount = matchingNotifications.reduce((total, notification) => {
      return total + (notification.content?.length || 0)
    }, 0)

    return totalCount
  }

  const active = discussion?.dx === dx

  const notificationCount = getNotificationCount()

  return (
    <li className={classNames({ active })} key={dx}>
      <Button
        onClick={async () => {
          if (notificationCount > 0) {
            await markNotificationsAsRead(
              discuss?.channelId,
              'sub-channel',
              discuss?.id
            )
          }

          setDiscussion({
            ...discuss,
            dx,
          })
          sdk?.selectChannel(discuss?.id)
        }}
        type="link"
        // disabled={!discuss?.id}
      >
        {discuss?.name}

        {isAdmin && (
          <div className="popover-container">
            <Popover
              placement="bottomLeft"
              overlayClassName={styles.forumOptions}
              content={
                <ul>
                  <li>
                    <Button
                      size="small"
                      type="link"
                      onClick={handleDeleteDiscussion(discuss)}
                    >
                      <Trans>Delete</Trans>
                    </Button>
                  </li>
                </ul>
              }
              trigger="click"
            >
              <MoreOutlined rotate={90} />
            </Popover>
          </div>
        )}
        {notificationCount > 0 && (
          <span className="notifcation-badge">{notificationCount}</span>
        )}
      </Button>
    </li>
  )
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default ForumView
