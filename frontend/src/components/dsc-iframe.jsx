import React, { useCallback, useEffect } from 'react'
import { ChatStore } from '../store'

const DSCIframe = ({ roomId, accessToken, frameId = 'chat-frame' }) => {
  const sdk = ChatStore.useState((s) => s.sdk)
  const iframeURL = `${process.env.NEXT_PUBLIC_DSC_URL}/${roomId}?accessToken=${accessToken}`

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

  return <iframe id={frameId} src={iframeURL} width="100%" />
}

export default DSCIframe
