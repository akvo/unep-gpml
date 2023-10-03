import React from 'react'
import { Avatar } from 'antd'

const ForumMembers = ({ initName, forum }) => {
  const { usersCount, users } = forum || {}
  return (
    <div className="participants">
      <Avatar.Group>
        {users.slice(0, 5).map((u, index) => (
          <Avatar src={u.image} key={index} aria-label={u.name}>
            {!u.image && initName(u.name)}
          </Avatar>
        ))}
        {usersCount - 5 > 0 && <Avatar>{`+${usersCount - 5}`}</Avatar>}
      </Avatar.Group>
    </div>
  )
}

export default ForumMembers
