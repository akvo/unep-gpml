import React, { useCallback, useEffect, useState } from 'react'
import { Avatar } from 'antd'
import styles from './forum-members.module.scss'
import api from '../../utils/api'
import { ChatStore, UIStore } from '../../store'

const ForumMembers = ({ forum }) => {
  const [users, setUsers] = useState(forum?.users || [])
  const [preload, setPreload] = useState(true)
  const usersCount = forum?.usersCount || users?.length
  const profile = UIStore.useState((s) => s.profile)

  const fetchData = useCallback(async () => {
    try {
      if (preload && profile?.id && !forum?.users && forum?.id) {
        setPreload(false)
        const { data: apiData } = await api.get(
          `/chat/channel/details/${forum.id}`
        )
        const { channel } = apiData || {}
        setUsers(channel?.users)
        ChatStore.update((s) => {
          s.allForums = s.allForums.map((a) =>
            a?.id === forum.id ? { ...a, users: channel?.users } : a
          )
        })
      }
    } catch (error) {
      console.error(error)
    }
  }, [preload, profile, forum?.users])

  /**
   * Disabled atm, due performance issue
   */
  // useEffect(() => {
  //   fetchData()
  // }, [fetchData])

  return (
    <div className={styles.membersView}>
      <Avatar.Group>
        {users?.slice(0, 5)?.map((u, index) => {
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
