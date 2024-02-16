import { useCallback, useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

import styles from './index.module.scss'
import { ChatStore } from '../../../store'

const ForumView = () => {
  const [sdk, setSDK] = useState(null)
  const router = useRouter()
  const accessToken = ChatStore.useState((s) => s.accessToken)

  const iframeURL = useMemo(() => {
    if (!router.query?.forum) {
      return null
    }
    if (accessToken) {
      return `${process.env.NEXT_PUBLIC_DSC_URL}/${router.query.forum}?accessToken=${accessToken}`
    }
    return `${process.env.NEXT_PUBLIC_DSC_URL}/${router.query.forum}`
  }, [accessToken, router.query?.forum])

  const handleOnSetup = useCallback(async () => {
    if (window?.DSChatSDK) {
      const jsSDK = new window.DSChatSDK(
        router.query.forum,
        'chat-frame',
        process.env.NEXT_PUBLIC_DSC_PUBLIC_KEY
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
      {iframeURL && <iframe id="chat-frame" src={iframeURL} width="100%" />}
    </div>
  )
}

export default ForumView
