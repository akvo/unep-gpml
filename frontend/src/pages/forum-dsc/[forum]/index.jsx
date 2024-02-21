import Head from 'next/head'
import { useRouter } from 'next/router'
import { Layout } from 'antd'

import styles from '../../forum/channel.module.scss'
import { ChatStore } from '../../../store'
import DSCIframe from '../../../components/dsc-iframe'

const { Sider } = Layout

const ForumView = () => {
  const router = useRouter()
  const accessToken = ChatStore.useState((s) => s.accessToken)

  return (
    <div className={styles.container}>
      <Head>
        <script src="https://cdn.deadsimplechat.com/sdk/1.2.1/dschatsdk.min.js"></script>
      </Head>
      <Layout>
        <Sider className={styles.channelSidebar} width={335}>
          {/* TODO: SIDEBAR */}
        </Sider>
        <Layout className={styles.channelContent}>
          {router.query?.forum && (
            <DSCIframe roomId={router.query.forum} accessToken={accessToken} />
          )}
        </Layout>
      </Layout>
    </div>
  )
}

export default ForumView
