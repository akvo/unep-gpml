import React, { useEffect, useState } from 'react'

const DSCIframe = ({ roomId, accessToken, frameId = 'chat-frame' }) => {
  const [sdk, setSDK] = useState(null)
  const iframeURL = `${process.env.NEXT_PUBLIC_DSC_URL}/${roomId}?accessToken=${accessToken}`

  useEffect(() => {
    ;(async () => {
      // DSChatSDK construction accepts two parameters:
      // 1. Chat Room Id
      // 2. ID of the iFrame tag
      // 3. Dead Simple Chat Public API Key.
      if (window?.DSChatSDK && !sdk) {
        const sdk = new window.DSChatSDK(
          roomId,
          frameId,
          process.env.NEXT_PUBLIC_DSC_PUBLIC_KEY
        )
        // Call the connect method to connect the SDK to the Chat iFrame.
        await sdk.connect()
        setSDK(sdk)
      }
    })()
  }, [sdk])

  useEffect(() => {
    const unsubscribe = () => {
      if (sdk) {
        sdk.on('message', (message) => {
          console.log('New Message Arrived', message)
        })
      }
    }

    return () => unsubscribe()
  }, [sdk])

  return <iframe id={frameId} src={iframeURL} width="100%" />
}

export default DSCIframe
