import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, Spin } from 'antd'

const ForumMembers = ({ allForums, setAllForums, initName, forum }) => {
  const [preload, setPreload] = useState(true)
  const [members, setMembers] = useState([])
  const { usersCount, avatarUrl, id: forumId } = forum || {}

  const getAllMembers = useCallback(async () => {
    const _members = await new Promise((resolve, _) => {
      setTimeout(() => {
        const _fakeMembers = Array.from({ length: usersCount }).map(
          (_, ix) => ({
            id: ix,
            name: `Marie-Celine Marechal ${ix + 1}`,
            image: ix % 2 === 0 ? null : avatarUrl,
            title: 'UNEP France',
          })
        )
        resolve(_fakeMembers)
      }, 2000)
    })
    setMembers(_members)
    setPreload(false)
  }, [usersCount, avatarUrl])

  useEffect(() => {
    const findForum = allForums.find((a) => a.id === forumId)
    if (!findForum?.members && members.length) {
      const _all = allForums.map((a) =>
        a?.id === forumId ? { ...findForum, members } : a
      )
      setAllForums(_all)
    }
  }, [allForums, members, forumId])

  useEffect(() => {
    getAllMembers()
  }, [getAllMembers])

  return (
    <div className="participants">
      {preload ? (
        <Spin />
      ) : (
        <Avatar.Group>
          {members.slice(0, 5).map((m, mx) => (
            <Avatar src={m.image}>{!m.image && initName(m.name)}</Avatar>
          ))}
          {usersCount - 5 > 0 && <Avatar>{`+${usersCount - 5}`}</Avatar>}
        </Avatar.Group>
      )}
    </div>
  )
}

export default ForumMembers
