import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import { UIStore } from '../store'
import { formatTime } from '../utils/misc'

const transformNotificationsForDisplay = (rawNotifications) => {
  const transformedNotifications = []

  rawNotifications.forEach((item) => {
    if (item.content && item.content.length > 0) {
      item.content.forEach((message, index) => {
        transformedNotifications.push({
          id: `${item.id}-${index}`,
          sender: message.username || 'Unknown User',
          type: item.title || 'Unknown Channel',
          message: message.message || 'No message',
          time: message.created ? formatTime(message.created) : 'Unknown time',
          contextId: item['contextId'],
          notificationType: item.type,
          status: item.status,
          subType: item['subType'],
          parentId: item.id,
          chatAccountId: message['chatAccountId'],
          conversationId: message['conversationId'],
          uniqueUserIdentifier: message['uniqueUserIdentifier'],
          subContextId: item['subContextId'] || null,
          created: message.created,
        })
      })
    }
  })

  return transformedNotifications.sort((a, b) => {
    if (a.status === 'unread' && b.status !== 'unread') return -1
    if (a.status !== 'unread' && b.status === 'unread') return 1

    const dateA = new Date(a.created)
    const dateB = new Date(b.created)
    return dateB - dateA
  })
}

const useNotifications = (isAuthenticated) => {
  const [loading, setLoading] = useState(false)
  const [displayCount, setDisplayCount] = useState(5)
  const [displayedNotifications, setDisplayedNotifications] = useState([])

  const { notifications: rawNotifications } = UIStore.useState((s) => ({
    notifications: s.notifications || [],
  }))

  const [allNotifications, setAllNotifications] = useState([])

  const unreadCount = allNotifications.filter(
    (notif) => notif.status === 'unread'
  ).length

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const params = new URLSearchParams({ status: 'all' })
      const response = await api.get(`/notifications?${params.toString()}`)

      UIStore.update((store) => {
        store.notifications = response.data
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const markNotificationsAsRead = useCallback(
    async (contextId, subType = 'channel', subContextId = null) => {
      if (!contextId || !rawNotifications || rawNotifications.length === 0) {
        return
      }

      let matchingNotifications

      if (subType === 'conversation' && subContextId) {
        matchingNotifications = rawNotifications.filter(
          (notification) =>
            notification['subContextId'] === subContextId &&
            notification['subType'] === subType &&
            notification['status'] === 'unread'
        )
      } else if (subType === 'sub-channel' && subContextId) {
        matchingNotifications = rawNotifications.filter(
          (notification) =>
            notification['subContextId'] === subContextId &&
            notification['subType'] === subType &&
            notification['status'] === 'unread'
        )
      } else {
        matchingNotifications = rawNotifications.filter(
          (notification) =>
            notification['contextId'] === contextId &&
            notification['subType'] === subType &&
            notification['status'] === 'unread'
        )
      }

      if (!matchingNotifications.length) {
        return
      }

      const notificationIds = matchingNotifications.map(
        (notification) => notification.id
      )

      try {
        await api.post('/notifications/status', {
          ids: notificationIds,
          status: 'read',
        })

        UIStore.update((store) => {
          if (store.notifications) {
            store.notifications = store.notifications.map((notification) => {
              if (notificationIds.includes(notification.id)) {
                return { ...notification, status: 'read' }
              }
              return notification
            })
          }
        })

        const identifier =
          subType === 'conversation' || subType === 'sub-channel'
            ? subContextId
            : contextId
        console.log(
          `Marked ${
            notificationIds.length
          } '${subType}' notifications as read for ${
            subType === 'conversation' || subType === 'sub-channel'
              ? 'subContext'
              : 'context'
          }: ${identifier}`
        )
      } catch (error) {
        console.error('Error marking notifications as read:', error)
      }
    },
    [rawNotifications]
  )

  const handleViewMore = useCallback(() => {
    const newDisplayCount = displayCount + 5
    setDisplayCount(newDisplayCount)
    setDisplayedNotifications(allNotifications.slice(0, newDisplayCount))
  }, [displayCount, allNotifications])

  useEffect(() => {
    const transformed = transformNotificationsForDisplay(rawNotifications)
    setAllNotifications(transformed)
  }, [rawNotifications])

  useEffect(() => {
    setDisplayedNotifications(allNotifications.slice(0, displayCount))
  }, [allNotifications, displayCount])

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
    }
  }, [isAuthenticated])

  const hasMoreNotifications = displayCount < allNotifications.length

  return {
    // Data
    allNotifications,
    displayedNotifications,
    unreadCount,
    rawNotifications,

    // State
    loading,
    hasMoreNotifications,

    // Actions
    fetchNotifications,
    markNotificationsAsRead,
    handleViewMore,

    // Utils
    transformNotificationsForDisplay,
  }
}

export default useNotifications
