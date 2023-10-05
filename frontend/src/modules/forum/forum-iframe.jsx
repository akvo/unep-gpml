import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDeviceSize } from '../landing/landing'
import { ChatStore } from '../../store'

const ForumIframe = ({ channelName, channelType }) => {
  const [preload, setPreload] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const ifReff = useRef()
  const [_, height] = useDeviceSize()
  const iFrameCurrent = ifReff.current
  const prefixPATH = channelType === 'c' ? 'channel' : 'group'
  const channelURL = `${process.env.NEXT_PUBLIC_CHAT_API_DOMAIN_URL}/${prefixPATH}/${channelName}?layout=embedded`
  const isLoggedIn = ChatStore.useState((s) => s.isLoggedIn)

  const handleOnLoadIframe = () => {
    if (iFrameCurrent && !isReady) {
      setTimeout(() => {
        /**
         * Added a 5 second delay
         * for Rocket chat to fully prepare
         */
        setIsReady(true)
      }, 5000)
    }
  }

  const handleSSO = useCallback(() => {
    if (iFrameCurrent && preload && isReady && !isLoggedIn) {
      console.info('requests login with auth0')
      setPreload(false)
      iFrameCurrent.contentWindow.postMessage(
        {
          externalCommand: 'call-custom-oauth-login',
          service: 'auth0',
        },
        '*'
      )
      setTimeout(() => {
        /**
         * Added a 5 second delay
         * so that the redirect to the channel can be executed
         */
        iFrameCurrent.contentWindow.postMessage(
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
    }
    console.log('isLoggedIn', isLoggedIn)
  }, [iFrameCurrent, preload, isReady, isLoggedIn])

  useEffect(() => {
    handleSSO()
  }, [handleSSO])
  return (
    <iframe
      src={channelURL}
      frameBorder="0"
      style={{
        overflow: 'hidden',
        width: '100%',
        height,
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
