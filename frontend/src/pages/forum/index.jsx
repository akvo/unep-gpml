import React, { useCallback, useEffect, useState } from 'react'
import {
  Card,
  Form,
  Input,
  List,
  Modal,
  Popover,
  Radio,
  notification,
} from 'antd'
import dynamic from 'next/dynamic'
import styles from './index.module.scss'
import Button from '../../components/button'
import { ChatStore, UIStore } from '../../store'
import api from '../../utils/api'
import ForumMembers from '../../modules/forum/forum-members'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../translations/utils'
import Head from 'next/head'
import TextArea from 'antd/lib/input/TextArea'
import { MoreOutlined } from '@ant-design/icons'

const DynamicForumModal = dynamic(
  () => import('../../modules/forum/forum-modal'),
  {
    ssr: false, // modal has window object that should be run in client side
  }
)

const DynamicMyForum = dynamic(() => import('../../modules/forum/my-forums'), {
  ssr: false, // my forums has window object to update the joins localStorage
})

const Forum = ({
  isAuthenticated,
  setLoginVisible,
  profile,
  setShouldJoin,
}) => {
  const [viewModal, setViewModal] = useState({
    open: false,
    data: {},
  })
  const [loading, setLoading] = useState(true)
  const [preload, setPreload] = useState(true)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [requestModal, setRequestModal] = useState(false)
  const allForums = ChatStore.useState((s) => s.allForums)

  const handleOnView = (data) => {
    setViewModal({
      open: true,
      data,
    })
  }

  const getAllForums = useCallback(async () => {
    try {
      ChatStore.update((s) => {
        s.sdk = null
      })
      if (loading && allForums.length) {
        setLoading(false)
        // reset discussion
        ChatStore.update((s) => {
          s.discussion = null
        })
      }
      if (!allForums.length && loading) {
        const { data: apiData } = await api.get('/chat/channel/all')
        const { channels: _allForums } = apiData || {}

        ChatStore.update((s) => {
          s.allForums = _allForums
        })
        setLoading(false)
      }
    } catch (error) {
      console.error('err', error)
      setLoading(false)
    }
  }, [loading, allForums])

  const activateChatAccount = useCallback(async () => {
    if (preload && isAuthenticated && profile?.id && !profile?.chatAccountId) {
      setPreload(false)
      try {
        await api.post('/chat/user/account')
        const { data: _profile } = await api.get('/profile')
        UIStore.update((s) => {
          s.profile = _profile
        })
      } catch (error) {
        console.error('Activation failed:', error)
      }
    }
  }, [preload, profile, isAuthenticated])

  useEffect(() => {
    activateChatAccount()
  }, [activateChatAccount])

  useEffect(() => {
    getAllForums()
  }, [getAllForums])

  const handleEditItem = (item) => {
    setEditItem(item)
    setAddModalVisible(true)
  }

  return (
    <>
      <Head>
        {/* HTML Meta Tags */}
        <title>Forums | Global Plastics Hub</title>
      </Head>
      <div className="container">
        <div className={styles.forumHome}>
          <span className="h-xs title">
            <Trans>Forums</Trans>
          </span>
          <DynamicMyForum {...{ handleOnView }} />

          <div className="header">
            <div className="jumbotron">
              <h2>
                <Trans>All Forums</Trans>
              </h2>
              <p className="h-xs">
                <Trans>
                  Welcome to the Global Partnership on Plastic Pollution and
                  Marine Litter (GPML) Digital Platform forums page. A space
                  where you can interact, network, and share insights and
                  information with other like-minded advocates on issues related
                  to plastic pollution and marine litter strategies, models and
                  methodologies, data harmonization, innovative financing, and
                  Capacity Building. Your voice matters, join now and be part of
                  the wave for change.
                </Trans>
              </p>
            </div>
            {profile?.role === 'ADMIN' && (
              <Button
                type="ghost"
                onClick={() => {
                  setAddModalVisible(true)
                }}
              >
                <span className="hide-mobile">Add New Forum</span>
                <span className="hide-desktop">+</span>
              </Button>
            )}
          </div>
          <section>
            <List
              grid={{ lg: 3, column: 3, gutter: 20, md: 2, sm: 1, xs: 1 }}
              dataSource={allForums}
              loading={loading}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <ChannelCard
                    {...{
                      item,
                      handleOnView,
                      profile,
                      ChatStore,
                      handleEditItem,
                    }}
                  />
                </List.Item>
              )}
            />
          </section>
          <h5 style={{ marginTop: 50, marginBottom: 20 }}>
            Can't find what you're looking for?
          </h5>
          <Button
            type="ghost"
            onClick={() => {
              setRequestModal(true)
              setAddModalVisible(true)
            }}
          >
            Request a new forum
          </Button>
          <div style={{ margin: 50 }} />
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
          <AddModal
            visible={addModalVisible}
            onCancel={() => setAddModalVisible(false)}
            {...{ editItem, setEditItem, requestModal, setRequestModal }}
          />
        </div>
      </div>
    </>
  )
}

export const ChannelCard = ({
  item,
  handleOnView,
  profile,
  handleEditItem,
}) => {
  const isAdmin = profile?.role === 'ADMIN'
  const [showPopover, setShowPopover] = useState(false)

  const handleEdit = () => {
    setShowPopover(false)
    handleEditItem(item)
  }
  // console.log(item)
  const handleDelete = () => {
    if (confirm('are you sure?')) {
      api.delete(`/chat/admin/channel/${item.id}`).then(() => {
        ChatStore.update((s) => {
          s.allForums = s.allForums.filter((it) => it.id !== item.id)
        })
      })
    }
  }

  return (
    <Card>
      <div className="channel">
        <span className={styles.forumType}>
          {item.privacy === 'private' ? t`private` : t`public`} {t`channel`}
        </span>
        <h5>{item.name?.replace(/[-_]/g, ' ')}</h5>
        {isAdmin && (
          <div className="popover-container">
            <Popover
              placement="bottomLeft"
              visible={showPopover}
              overlayClassName={styles.popover}
              onVisibleChange={(isOpen) => {
                // const popValue = isOpen ? index : null
                setShowPopover(isOpen)
              }}
              content={
                <ul>
                  <li>
                    <Button type="link" onClick={handleEdit}>
                      <Trans>Edit</Trans>
                    </Button>
                  </li>
                  <li>
                    <Button type="link" onClick={handleDelete}>
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
        <p className={styles.forumDesc}>
          {item?.description?.substring(0, 120)}
          {item?.description?.length > 120 && '...'}
        </p>
      </div>
      <div className="flex">
        <ForumMembers forum={item} />
        <div>
          <Button size="small" onClick={() => handleOnView(item)} ghost>
            <Trans>View</Trans>
          </Button>
        </div>
      </div>
    </Card>
  )
}

const AddModal = ({
  visible,
  onCancel,
  editItem,
  setEditItem,
  requestModal,
  setRequestModal,
}) => {
  const initialState = {
    name: '',
    description: '',
    privacy: 'public',
  }
  const [form, setForm] = useState({ ...initialState })
  const [loading, setLoading] = useState(false)
  const handleOnChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
  }
  const handleSubmit = () => {
    if (editItem != null) {
      api.put(`/chat/admin/channel/${editItem.id}`, form).then(() => {
        notification.success({ message: 'Channel edited.' })
        onCancel()
      })
    } else {
      api
        .post('/chat/admin/channel', form)
        .then(() => {
          notification.success({ message: 'New channel created.' })
          onCancel()
        })
        .catch((e, d) => {
          notification.error({ message: "Coundn't add channel." })
          // console.log('handle error', e, d)
        })
    }
  }
  const handleRequest = () => {
    api.post('/chat/channel/request-new', form).then(() => {
      notification.success({
        message: 'We will review your request shortly.',
      })
      onCancel()
    })
  }
  useEffect(() => {
    if (visible && editItem != null) {
      const { name, description, privacy } = editItem
      setForm({ name, description, privacy })
    }
    if (!visible) {
      setEditItem(null)
      setRequestModal(false)
      setForm({ ...initialState })
    }
  }, [visible])
  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      title={editItem == null ? 'Add New Forum' : 'Edit Forum'}
      footer={null}
    >
      <Form layout="vertical">
        <Form.Item label="Title">
          <Input
            title="Title"
            value={form.name}
            onChange={handleOnChange('name')}
          />
        </Form.Item>
        <Form.Item label="Description">
          <TextArea
            title="Description"
            value={form.description}
            onChange={handleOnChange('description')}
          />
        </Form.Item>
        <Form.Item label="Privacy">
          <Radio.Group
            value={form.privacy}
            onChange={handleOnChange('privacy')}
            disabled={editItem != null}
          >
            <Radio value="public">Public</Radio>
            <Radio value="private">Private</Radio>
          </Radio.Group>
        </Form.Item>
        <div style={{ display: 'flex' }}>
          {requestModal ? (
            <Button onClick={handleRequest}>Request Channel</Button>
          ) : (
            <Button onClick={handleSubmit}>Save</Button>
          )}
          <Button type="ghost" onClick={onCancel} style={{ marginLeft: 15 }}>
            Cancel
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Forum
