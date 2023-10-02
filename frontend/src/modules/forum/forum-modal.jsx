import React, { useState } from 'react'
import { Avatar, List, Modal, message } from 'antd'
import sample from 'lodash/sample'
import Button from '../../components/button'
import api from '../../utils/api'
import styles from './forum.module.scss'

const ForumModal = ({ viewModal, setViewModal, initName }) => {
  const [requesting, setRequesting] = useState(false)
  const colorList = ['purple', 'green', 'blue', 'dark-blue']

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
      message.success('Join request sent!')
      setRequesting(false)
      setViewModal({
        open: false,
        data: {},
      })
    } catch (error) {
      message.error(error?.response?.message)
      setRequesting(false)
    }
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
          {viewModal?.data?.t === 'p' ? (
            <Button
              onClick={() => handleOnRequestJoin(viewModal?.data)}
              loading={requesting}
            >
              Request to Join
            </Button>
          ) : (
            <Button withArrow="link" size="small">
              View channel
            </Button>
          )}
        </>
      }
    >
      <p className={styles.forumDesc}>{viewModal?.data?.description}</p>
      <h6>Participants ({viewModal?.data?.usersCount})</h6>
      <List
        className="members"
        grid={{
          column: 2,
        }}
        dataSource={viewModal?.data?.members}
        renderItem={(member) => (
          <List.Item key={member.id}>
            <List.Item.Meta
              avatar={
                <Avatar src={member.image} className={sample(colorList)}>
                  {!member.image && initName(member.name)}
                </Avatar>
              }
              title={member.name}
              description={member.title}
            />
          </List.Item>
        )}
      />
    </Modal>
  )
}

export default ForumModal
