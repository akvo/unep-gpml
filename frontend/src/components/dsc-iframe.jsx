import React, { useCallback, useEffect, useMemo } from 'react'
import classNames from 'classnames'

import { ChatStore, UIStore } from '../store'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const DSCIframe = ({ roomId, frameId = 'chat-frame', discussion = null }) => {
  const sdk = ChatStore.useState((s) => s.sdk)
  const profile = UIStore.useState((s) => s.profile)
  const { accessToken, chatAccountId: uniqueUserIdentifier } = profile || {}

  const iframeURL = useMemo(() => {
    return accessToken
      ? `${process.env.NEXT_PUBLIC_DSC_URL}/${roomId}?accessToken=${accessToken}`
      : `${process.env.NEXT_PUBLIC_DSC_URL}/${roomId}?uniqueUserIdentifier=${uniqueUserIdentifier}`
  }, [accessToken, uniqueUserIdentifier])

  const getActiveChannels = useCallback(async () => {
    if (sdk) {
      const { channels } = await sdk.getActiveChannels()
      ChatStore.update((s) => {
        s.channels = channels
      })
    }
  }, [sdk])

  useEffect(() => {
    getActiveChannels()
  }, [getActiveChannels])

  useEffect(() => {
    ;(async () => {
      // DSChatSDK construction accepts two parameters:
      // 1. Chat Room Id
      // 2. ID of the iFrame tag
      // 3. Dead Simple Chat Public API Key.
      if (window?.DSChatSDK) {
        ChatStore.update((s) => {
          s.channels = []
        })
        try {
          const jsSDK = new window.DSChatSDK(
            roomId,
            frameId,
            process.env.NEXT_PUBLIC_DSC_PUBLIC_KEY
          )
          // Call the connect method to connect the SDK to the Chat iFrame.
          await jsSDK.connect()
          ChatStore.update((s) => {
            s.sdk = jsSDK
          })
        } catch (error) {
          console.error('SDK', error)
        }
      }
    })()
  }, [window?.DSChatSDK])

  useEffect(() => {
    const unsubscribe = () => {
      sdk?.on('message', (message) => {
        console.log('New Message Arrived', message)
      })
      sdk?.on('not_authorized', (message) => {
        console.log('not_authorized', message)
      })
      sdk?.on('channelSelected', (channelInfo) => {
        console.log('Channel Selected:', channelInfo)
      })
    }

    return () => unsubscribe()
  }, [sdk])

  return (
    <Spin spinning={!profile?.chatAccountId} indicator={<LoadingOutlined />}>
      <iframe
        id={frameId}
        src={iframeURL}
        width="100%"
        className={classNames({ discussion })}
      />
    </Spin>
  )
}

export default DSCIframe
