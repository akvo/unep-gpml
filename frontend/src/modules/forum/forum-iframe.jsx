import React, { useEffect, useState } from 'react'
import { ChatStore } from '../../store'
import api from '../../utils/api'
import classNames from 'classnames'

const ForumIframe = ({
  discussion,
  channelName,
  channelType,
  isAuthenticated,
  loadingProfile,
  setLoginVisible,
}) => {
  const [preload, setPreload] = useState(true)
  const prefixPATH = channelType === 'c' ? 'channel' : 'group'
  const channelURL = `${process.env.NEXT_PUBLIC_CHAT_API_DOMAIN_URL}/${prefixPATH}/${channelName}?layout=embedded`
  const isLoggedInRocketChat = ChatStore.useState((s) => s.isLoggedIn)

  const goToChannelPage = (iFrame) => {
    try {
      iFrame?.contentWindow?.postMessage(
        {
          externalCommand: 'go',
          path: `/${prefixPATH}/${channelName}?layout=embedded`,
        },
        '*'
      )
    } catch (error) {
      console.error('client RC iframe error', error)
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
      console.error('client RC iframe error', error)
    }
  }

  const handleOnLoadIframe = () => {
    const iFrame = document.querySelector('iframe')
    const isAuth0 = isAuthenticated && !loadingProfile

    if (iFrame && isAuth0 && preload) {
      setTimeout(() => {
        if (!isLoggedInRocketChat) {
          handleRocketChatSSO(iFrame)

          ChatStore.update((s) => {
            s.isLoggedIn = true
          })

          setTimeout(() => {
            goToChannelPage(iFrame)
          }, 5000)
        }

        setPreload(false)
      }, 3000)
    }
  }

  const handleRocketChatAction = async (e) => {
    /**
     * @tutorial https://developer.rocket.chat/customize-and-embed/iframe-integration/iframe-events
     * @prop e.data.eventName
     * @prop e.data.data: get related user's data
     * Triggered join button by checking eventName = 'new-message'
     * 'new-message' has been chosen because each new member will be notified as a new message.
     */
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
    }
  }

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
      onLoad={handleOnLoadIframe}
      className={classNames({ discussion: discussion })}
    />
  )
}

export default ForumIframe
