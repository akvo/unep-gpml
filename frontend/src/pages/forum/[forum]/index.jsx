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
  PinDoc,
  PinForm,
  PinPdf,
  PinVideo,
} from '../../../components/icons'
import api from '../../../utils/api'
import { MoreOutlined } from '@ant-design/icons'
import { loadCatalog } from '../../../translations/utils'

const ForumView = ({ isAuthenticated, profile }) => {
  const router = useRouter()
  const [activeForum, setActiveForum] = useState(null)
  const [sdk, setSDK] = useState(null)
  const [discussion, setDiscussion] = useState(null)
  const [userJoined, setUserJoined] = useState(false)

  const { chatAccountAuthToken: accessToken } = profile || {}

  const iframeURL = useMemo(() => {
    if (!router.query?.forum) {
      return null
    }
    return `${process.env.NEXT_PUBLIC_DSC_URL}/${router.query.forum}?accessToken=${accessToken}`
  }, [router.query?.forum, accessToken])

  const fetchData = useCallback(async () => {
    try {
      if (profile?.id && router.query?.forum) {
        const { data: apiData } = await api.get(
          `/chat/channel/details/${router.query.forum}`
        )
        const { channel: _activeForum } = apiData || {}
        setUserJoined(
          _activeForum.users.findIndex((it) => it.id === profile.id) !== -1
        )
        setActiveForum(_activeForum)
      }
    } catch (error) {
      console.error(error)
    }
  }, [isAuthenticated, profile, router.query?.forum])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    ;(async () => {
      // DSChatSDK construction accepts two parameters:
      // 1. Chat Room Id
      // 2. ID of the iFrame tag
      // 3. Dead Simple Chat Public API Key.
      try {
        if (window?.DSChatSDK && activeForum && !sdk) {
          const _sdk = new window.DSChatSDK(
            activeForum.id,
            'chat-frame',
            process.env.NEXT_PUBLIC_DSC_PUBLIC_KEY
          )
          // Call the connect method to connect the SDK to the Chat iFrame.
          await _sdk.connect()

          setSDK(_sdk)
        }
      } catch (error) {
        console.error('SDK', error)
      }
    })()
  }, [activeForum, sdk])
  useEffect(() => {
    if (sdk != null) {
      sdk.loadCustomization({
        hideSidebar: true,
        hideHeader: true,
        hideChatInputTextArea: !userJoined,
      })
    }
  }, [sdk, userJoined])
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
  return (
    <>
      <Head>
        <script src="https://cdn.deadsimplechat.com/sdk/1.2.1/dschatsdk.min.js"></script>
      </Head>
      <div className={styles.container}>
        {/* <div className={styles.channelSidebar}> */}
        <div className={styles.sidebar}>
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
          <PinnedLinks {...{ isAdmin, channelId }} />
          {activeForum != null && (
            <Discussions
              discussions={activeForum.discussions}
              channelId={router.query.forum}
              {...{ discussion, setDiscussion, sdk, profile, setActiveForum }}
            />
          )}
          {activeForum?.users?.length > 0 && (
            <Participants {...{ isAdmin, activeForum, channelId }} />
          )}
        </div>

        {/* </div> */}
        <Layout className={styles.content}>
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
        {/* </div> */}
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
  const [showModal, setShowModal] = useState(false)
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
      setShowModal(false)
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
  }
  return (
    <>
      <h6 className="w-bold h-caps-xs">
        <Trans>Pinned Documents</Trans>
      </h6>
      <div className="mobile-scroller-horiz">
        <ul className="pinned-links">
          {items.map((item) => {
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
                  setShowModal(true)
                }}
              >
                + Add New Document Link
              </Button>
            </li>
          )}
        </ul>
      </div>
      <Modal
        visible={showModal}
        onCancel={() => {
          setShowModal(false)
        }}
        footer={null}
        title="Add New Pinned Document"
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
              </Radio.Group>
            </Form.Item>
            <hr />
            <div>
              <Button
                type="primary"
                className="noicon"
                onClick={handleSubmit}
                loading={sending}
              >
                Add New Pinned Document
              </Button>
              <Button
                type="ghost"
                className="noborder"
                onClick={() => {
                  setShowModal(false)
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

const Participants = ({ isAdmin, activeForum, channelId }) => {
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserLabel, setSelectedUserLabel] = useState('')

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
            return (
              <List.Item>
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
              </List.Item>
            )
          }}
          z
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
  profile,
  setActiveForum,
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
    api.get(`/chat/channel/discussions/${channelId}`).then((d) => {
      setDiscussions(d.data.discussions)
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
                Create Disussion
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
}) => {
  const active = discussion?.dx === dx
  return (
    <li className={classNames({ active })} key={dx}>
      <Button
        onClick={async () => {
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
      </Button>
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
    </li>
  )
}


export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}


export default ForumView
