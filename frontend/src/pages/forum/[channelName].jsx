import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useDeviceSize } from '../../modules/landing/landing'
import { Button, Layout } from 'antd'

const { Sider } = Layout

const ForumDetails = () => {
  const [preload, setPreload] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const ifReff = useRef()
  const router = useRouter()
  const { channelName } = router.query
  const [_, height] = useDeviceSize()
  const iFrameCurrent = ifReff.current
  const channelURL = `${process.env.NEXT_PUBLIC_CHAT_API_DOMAIN_URL}/channel/${channelName}?layout=embedded`

  const handleOnLogout = () => {
    // To trigger logout
    iFrameCurrent.contentWindow.postMessage(
      {
        externalCommand: 'logout',
      },
      '*'
    )
  }

  const handleSSO = useCallback(() => {
    if (iFrameCurrent && !isReady) {
      setTimeout(() => {
        setIsReady(true)
      }, 3000)
    }
    if (iFrameCurrent && preload && isReady) {
      setPreload(false)
      iFrameCurrent.contentWindow.postMessage(
        {
          externalCommand: 'call-custom-oauth-login',
          service: 'auth0',
        },
        '*'
      )
      iFrameCurrent.contentWindow.postMessage(
        {
          externalCommand: 'go',
          path: `/channel/${channelName}?layout=embedded`,
        },
        '*'
      )
    }
  }, [iFrameCurrent, preload, isReady])

  useEffect(() => {
    handleSSO()
  }, [handleSSO])

  return (
    <Layout>
      <Sider>
        {/* <Button onClick={handleOnLogout} type="link">
          Logout
        </Button> */}
      </Sider>
      <Layout>
        {channelName && (
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
            ref={ifReff}
          />
        )}
      </Layout>
    </Layout>
  )
}

export default ForumDetails
