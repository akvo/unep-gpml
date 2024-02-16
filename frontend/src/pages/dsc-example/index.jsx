import { useCallback, useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import styles from './index.module.scss'
import { Button, Space } from 'antd'

const GUEST_UUID = '23762b5b-7951-4d38-a2ed-f02185a65a17'

const DSCPage = () => {
  const [sdk, setSDK] = useState(null)

  const openFirstChannel = async () => {
    const { channels } = await sdk.getActiveChannels()
    const [firstChannel] = channels
    sdk.selectChannel(firstChannel?._id)
  }
  const handleOnSetup = useCallback(async () => {
    if (window?.DSChatSDK) {
      const jsSDK = new window.DSChatSDK(
        'pTDxZXWX-',
        'chat-frame',
        'pub_47434a7579375847583071713556774f5f7a5342557773347a514332524566654169626a6741395538414a5f7a703459'
      )
      // Call the connect method to connect the SDK to the Chat iFrame.
      await jsSDK.connect()
      setSDK(jsSDK)
    }
  }, [])

  useEffect(() => {
    handleOnSetup()
  }, [handleOnSetup])

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

  return (
    <div className={styles.container}>
      <Head>
        <script src="https://cdn.deadsimplechat.com/sdk/1.2.1/dschatsdk.min.js"></script>
      </Head>
      <Space>
        <Button onClick={openFirstChannel} size="small">
          Open first channel
        </Button>
      </Space>

      <iframe
        id="chat-frame"
        src={`https://deadsimplechat.com/pTDxZXWX-?uniqueUserIdentifier=${GUEST_UUID}`}
        width="100%"
      />
    </div>
  )
}

export default DSCPage
