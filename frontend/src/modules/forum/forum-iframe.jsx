import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChatStore } from '../../store'
import api from '../../utils/api'

const ForumIframe = ({
  channelName,
  channelType,
  isAuthenticated,
  loadingProfile,
  setLoginVisible,
}) => {
  const [preload, setPreload] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const ifReff = useRef()
  const iFrameCurrent = ifReff.current
  const prefixPATH = channelType === 'c' ? 'channel' : 'group'
  console.log(process.env.NEXT_PUBLIC_CHAT_API_DOMAIN_URL)
  const channelURL = `${process.env.NEXT_PUBLIC_CHAT_API_DOMAIN_URL}/${prefixPATH}/${channelName}?layout=embedded`
  const isLoggedIn = ChatStore.useState((s) => s.isLoggedIn)

  const handleOnLoadIframe = () => {
    if (!isReady) {
      setTimeout(() => {
        /**
         * Added a 5 second delay
         * for Rocket chat to fully prepare
         */
        setIsReady(true)
      }, 5000)
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

  const handleSSO = useCallback(() => {
    const isFunction =
      typeof iFrameCurrent?.contentWindow?.postMessage === 'function'
    /**
     * It should be triggered when the isAuthenticated & loadingProfile are true
     */
    const isAuth0 = isAuthenticated && !loadingProfile
    if (
      iFrameCurrent &&
      preload &&
      isReady &&
      !isLoggedIn &&
      isFunction &&
      isAuth0
    ) {
      setPreload(false)
      iFrameCurrent.contentWindow.postMessage(
        {
          externalCommand: 'call-custom-oauth-login',
          service: 'auth0',
        },
        '*'
      )
      const _timeout = setTimeout(() => {
        /**
         * Added a 5 second delay
         * so that the redirect to the channel can be executed
         */
        iFrameCurrent?.contentWindow?.postMessage(
          {
            externalCommand: 'go',
            path: `/${prefixPATH}/${channelName}?layout=embedded`,
          },
          '*'
        )
      }, 5000)
      ChatStore.update((s) => {
        s.isLoggedIn = true
      })
      return () => clearTimeout(_timeout)
    }
  }, [
    iFrameCurrent,
    preload,
    isReady,
    isLoggedIn,
    isAuthenticated,
    loadingProfile,
  ])

  useEffect(() => {
    handleSSO()
  }, [handleSSO])

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
      ref={ifReff}
    />
  )
}

export default ForumIframe
