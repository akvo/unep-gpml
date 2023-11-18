import React, { useCallback, useEffect } from 'react'
import { ChatStore, UIStore } from '../../store'
import api from '../../utils/api'
import classNames from 'classnames'

const ForumIframe = ({
  discussion,
  channelName,
  channelType,
  isAuthenticated,
  loadingProfile,
  setLoginVisible,
  discussionCallback,
}) => {
  const prefixPATH = channelType === 'c' ? 'channel' : 'group'
  const channelURL = `${process.env.NEXT_PUBLIC_CHAT_API_DOMAIN_URL}/${prefixPATH}/${channelName}?layout=embedded`
  const isLoggedInRocketChat = ChatStore.useState((s) => s.isLoggedIn)
  const profile = UIStore.useState((s) => s.profile)

  const goToChannelPage = (iFrame) => {
    try {
      iFrame.contentWindow.postMessage(
        {
          externalCommand: 'go',
          path: `/${prefixPATH}/${channelName}?layout=embedded`,
        },
        '*'
      )
    } catch (error) {
      console.error('client error RC iframe', error)
    }
  }

  const handleRocketChatSSO = (iFrame) => {
    try {
      iFrame.contentWindow.postMessage(
        {
          externalCommand: 'call-custom-oauth-login',
          service: 'auth0',
        },
        '*'
      )
    } catch (error) {
      console.error('client error RC iframe', error)
    }
  }

  const handleRocketChatAction = useCallback(
    async (e) => {
      /**
       * @tutorial https://developer.rocket.chat/customize-and-embed/iframe-integration/iframe-events
       * @prop e.data.eventName
       * @prop e.data.data: get related user's data
       * Triggered join button by checking eventName = 'new-message'
       * 'new-message' has been chosen because each new member will be notified as a new message.
       */
      const iFrame = document.querySelector('iframe')
      console.log(e.data)

      if (e.data === 'loaded') {
        const isValidUser =
          profile?.reviewStatus === 'APPROVED' && profile?.chatAccountId

        if (!isLoggedInRocketChat && isValidUser) {
          setTimeout(() => {
            handleRocketChatSSO(iFrame)
          }, 1000)
          ChatStore.update((s) => {
            s.isLoggedIn = true
          })
        }
      }
      if (e.data.eventName === 'Custom_Script_Logged_In') {
        goToChannelPage(iFrame)
      }

      if (e.data.eventName === 'new-message') {
        /**
         * Handling non-logged in user
         */
        if (!loadingProfile && !isAuthenticated) {
          setLoginVisible(true)
        }
        if (isAuthenticated) {
          /**
           * Get the latest my forums list after successfully joining
           */
          try {
            const { data: _myForums } = await api.get('/chat/user/channel')
            ChatStore.update((s) => {
              s.myForums = _myForums
            })
          } catch (error) {
            console.error('My forums error:', error)
          }
        }
        // if (e.data.data?.t === 'discussion-created') {
        //   discussionCallback('new', e.data.data)
        // }
      }

      if (e.data.eventName === 'room-opened') {
        discussionCallback('room-opened', e.data)
      }

      if (e.data.eventName === 'unread-changed-by-subscription') {
        if (e.data.data?.name === channelName) {
          discussionCallback('delete', e.data.data?._id)
        }
      }
    },
    [isLoggedInRocketChat, profile]
  )

  useEffect(() => {
    window.addEventListener('message', handleRocketChatAction)
    return () => {
      window.removeEventListener('message', handleRocketChatAction)
    }
  }, [handleRocketChatAction])

  return (
    <iframe
      src={channelURL}
      frameBorder="0"
      style={{
        overflow: 'hidden',
        width: '100%',
      }}
      width="100%"
      allow="camera;microphone"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      className={classNames({ discussion })}
    />
  )
}

export default ForumIframe
