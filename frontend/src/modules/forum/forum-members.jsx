import React from 'react'
import { Avatar } from 'antd'

const ForumMembers = ({ initName, avatarUrl, forum }) => {
  const { usersCount, users } = forum || {}
  return (
    <div className="participants">
      <Avatar.Group>
        {users.slice(0, 5).map((u, index) => {
          const userImage = u?.avatarETag
            ? `${avatarUrl}${u?.username}?etag=${u.avatarETag}`
            : null
          return (
            <Avatar src={userImage} key={index} aria-label={u.name}>
              {!userImage && initName(u.name)}
            </Avatar>
          )
        })}
        {usersCount - 5 > 0 && <Avatar>{`+${usersCount - 5}`}</Avatar>}
      </Avatar.Group>
    </div>
  )
}

export default ForumMembers
