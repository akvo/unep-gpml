import React from 'react'
import { Avatar } from 'antd'
import styles from './forum-members.module.scss'

const ForumMembers = ({ forum }) => {
  const { usersCount, users } = forum || {}

  const avatarUrl = `${process.env.NEXT_PUBLIC_CHAT_API_DOMAIN_URL}/avatar/`
  return (
    <div className={styles.membersView}>
      <Avatar.Group>
        {users.slice(0, 5).map((u, index) => {
          const userImage = u?.avatarETag
            ? `${avatarUrl}${u?.username}?etag=${u.avatarETag}`
            : null
          const [fistName, lastName] = u?.name?.split(/[ ,]+/)
          return (
            <Avatar src={userImage} key={index} aria-label={u.name}>
              {`${fistName[0]}${lastName?.[0] || ''}`}
            </Avatar>
          )
        })}
        {usersCount - 5 > 0 && <Avatar>{`+${usersCount - 5}`}</Avatar>}
      </Avatar.Group>
    </div>
  )
}

export default ForumMembers
