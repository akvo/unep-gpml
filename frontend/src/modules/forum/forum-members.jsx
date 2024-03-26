import React, { useCallback, useEffect, useState } from 'react'
import { Avatar } from 'antd'
import styles from './forum-members.module.scss'

const ForumMembers = ({ forum }) => {
  const usersCount = forum?.usersCount || forum?.users?.length

  return (
    <div className={styles.membersView}>
      <Avatar.Group>
        {forum?.users?.slice(0, 5)?.map((u, index) => {
          const fullName = `${u?.firstName} ${u?.lastName || ''}`
          return (
            <Avatar src={u?.picture} key={index} aria-label={fullName}>
              {u?.firstName[0]}
              {u?.lastName[0]}
            </Avatar>
          )
        })}
        {usersCount - 5 > 0 && <Avatar>{`+${usersCount - 5}`}</Avatar>}
      </Avatar.Group>
    </div>
  )
}

export default ForumMembers
