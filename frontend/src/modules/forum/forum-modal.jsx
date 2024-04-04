import React, { useMemo, useState } from 'react'
import { Avatar, List, Modal, message } from 'antd'
import { useRouter } from 'next/router'
import sample from 'lodash/sample'
import Button from '../../components/button'
import api from '../../utils/api'
import styles from './forum.module.scss'
import useLocalStorage from '../../utils/hooks/use-storage'
import { ChatStore } from '../../store'

const ForumModal = ({
  viewModal,
  setViewModal,
  setLoginVisible,
  isAuthenticated,
  profile,
}) => {
  const [requesting, setRequesting] = useState(false)
  const colorList = ['purple', 'green', 'blue', 'dark-blue']
  const [joins, setJoins] = useLocalStorage('joins', [])
  const isNotAMember =
    viewModal?.data?.privacy === 'private' &&
    viewModal?.data?.users.findIndex((it) => it.id === profile.id) === -1
  const joinDisabled = requesting || joins?.includes(viewModal?.data?.id)
  const participants = viewModal?.data?.users

  const router = useRouter()

  const handleOnClose = () => {
    setViewModal({
      open: false,
      data: {},
    })
  }

  const handleOnRequestJoin = async ({
    id: channel_id,
    name: channel_name,
  }) => {
    setRequesting(true)
    try {
      await api.post('/chat/channel/private', {
        channel_id,
        channel_name,
      })
      if (!joinDisabled) {
        setJoins([...joins, channel_id])
      }
      setRequesting(false)
    } catch (error) {
      message.error(error?.response?.message)
      setRequesting(false)
    }
  }

  const goToChannel = ({ id: roomId }) => {
    router.push(`/forum/${roomId}`)
  }

  return (
    <Modal
      closable
      title={
        <>
          <span className={styles.forumType}>
            {viewModal?.data?.privacy === 'private' ? 'private ' : 'public '}
            channel
          </span>
          <h5>{viewModal?.data?.name?.replace(/[-_]/g, ' ')}</h5>
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
              onClick={() => {
                if (isAuthenticated) {
                  handleOnRequestJoin(viewModal?.data)
                } else {
                  setLoginVisible(true)
                }
              }}
              loading={requesting}
              disabled={joinDisabled && isAuthenticated}
            >
              {joinDisabled && isAuthenticated
                ? 'Requested to Join'
                : 'Request to Join'}
            </Button>
          ) : (
            <Button
              withArrow="link"
              size="small"
              onClick={() => {
                if (isAuthenticated) {
                  goToChannel(viewModal.data)
                } else {
                  setLoginVisible(true)
                }
              }}
            >
              {isAuthenticated ? 'View channel' : 'Login to Chat'}
            </Button>
          )}
        </>
      }
    >
      <p className={styles.forumDesc}>{viewModal?.data?.description}</p>
      <h6>
        {participants?.length > 0
          ? `Participants (${participants.length})`
          : 'No participants'}
      </h6>
      {participants?.length > 0 && (
        <List
          className="members"
          grid={{
            column: 2,
          }}
          dataSource={participants}
          renderItem={(user) => {
            return (
              <List.Item key={user.id}>
                <List.Item.Meta
                  avatar={
                    <Avatar src={user?.picture} className={sample(colorList)}>
                      {`${user.firstName[0]}${user.lastName?.[0] || ''}`}
                    </Avatar>
                  }
                  title={`${user.firstName} ${user.lastName}`}
                  description={user?.org?.name}
                />
              </List.Item>
            )
          }}
        />
      )}
    </Modal>
  )
}

export default ForumModal
