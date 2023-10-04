import React, { useState } from 'react'
import { Avatar, List, Modal, message } from 'antd'
import { useRouter } from 'next/router'
import sample from 'lodash/sample'
import Button from '../../components/button'
import api from '../../utils/api'
import styles from './forum.module.scss'
import useLocalStorage from '../../utils/hooks/use-storage'

const ForumModal = ({ viewModal, setViewModal, initName, avatarUrl }) => {
  const [requesting, setRequesting] = useState(false)
  const colorList = ['purple', 'green', 'blue', 'dark-blue']
  const [joins, setJoins] = useLocalStorage('joins', [])
  const joinDisabled = requesting || joins?.includes(viewModal?.data?.id)
  const isNotAMember =
    viewModal?.data?.t === 'p' &&
    (viewModal?.data?.joined === undefined || !viewModal?.data?.joined)
  const router = useRouter()

  const handleOnClose = () => {
    setViewModal({
      open: false,
      data: {},
    })
  }

  const handleOnRequestJoin = async ({ id, name: channel_name }) => {
    setRequesting(true)
    try {
      await api.post('/chat/channel/private', {
        channel_name,
      })
      if (!joinDisabled) {
        setJoins([...joins, id])
      }
      setRequesting(false)
    } catch (error) {
      message.error(error?.response?.message)
      setRequesting(false)
    }
  }

  const goToChannel = ({ name }) => {
    router.push(`/forum/${name}`)
  }

  return (
    <Modal
      closable
      title={
        <>
          <span className={styles.forumType}>
            {viewModal?.data?.t === 'p' ? 'private ' : 'public '}channel
          </span>
          <h5>{viewModal?.data?.name}</h5>
        </>
      }
      width={702}
      visible={viewModal.open}
      className={styles.forumDetailsView}
      footer={
        <>
          <Button type="link" size="small" onClick={handleOnClose}>
            Close
          </Button>
          {isNotAMember ? (
            <Button
              onClick={() => handleOnRequestJoin(viewModal?.data)}
              loading={requesting}
              disabled={joinDisabled}
            >
              {joinDisabled ? 'Requested to Join' : 'Request to Join'}
            </Button>
          ) : (
            <Button
              withArrow="link"
              size="small"
              onClick={() => goToChannel(viewModal.data)}
            >
              View channel
            </Button>
          )}
        </>
      }
    >
      <p className={styles.forumDesc}>{viewModal?.data?.description}</p>
      <h6>
        {viewModal?.data?.users?.length > 0
          ? `Participants (${viewModal.data.users.length})`
          : 'No participants'}
      </h6>
      <List
        className="members"
        grid={{
          column: 2,
        }}
        dataSource={viewModal?.data?.users}
        renderItem={(user) => {
          const userImage = user?.avatarETag
            ? `${avatarUrl}${user?.username}?etag=${user.avatarETag}`
            : null
          return (
            <List.Item key={user.id}>
              <List.Item.Meta
                avatar={
                  <Avatar src={userImage} className={sample(colorList)}>
                    {!userImage && initName(user.name)}
                  </Avatar>
                }
                title={user.name}
                description={user.nickname}
              />
            </List.Item>
          )
        }}
      />
    </Modal>
  )
}

export default ForumModal
