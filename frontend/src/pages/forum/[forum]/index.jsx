import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Button, Layout, List } from 'antd'
import { Trans } from '@lingui/macro'
import classNames from 'classnames'

import styles from './index.module.scss'
import { ChatStore } from '../../../store'
import DSCIframe from '../../../components/dsc-iframe'
import { DropDownIcon } from '../../../components/icons'

const { Sider } = Layout

const ForumView = ({ profile }) => {
  const router = useRouter()
  const [activeForum, setActiveForum] = useState(null)

  const channels = ChatStore.useState((s) => s.channels)
  const sdk = ChatStore.useState((s) => s.sdk)
  const discussion = ChatStore.useState((s) => s.discussion)

  return (
    <div className={styles.container}>
      <Head>
        <script src="https://cdn.deadsimplechat.com/sdk/1.2.1/dschatsdk.min.js"></script>
      </Head>
      <Layout>
        <Sider className={styles.channelSidebar} width={335}>
          <div className={styles.detailSidebar}>
            <div className="description">
              <Button
                type="link"
                onClick={() => router.push('/forum')}
                icon={<DropDownIcon />}
                className={styles.backButton}
              >
                <Trans>Back to all Forums</Trans>
              </Button>
              <h5>{activeForum?.name}</h5>
              <p>{activeForum?.description}</p>
            </div>
            {channels?.length > 0 && (
              <>
                <h6 className="h-caps-xs w-bold">
                  <Trans>Discussions</Trans>
                </h6>
                <List
                  className="discussions"
                  dataSource={channels}
                  renderItem={(channel) => {
                    const active = discussion?._id === channel?._id
                    return (
                      <List.Item
                        key={channel?._id}
                        className={classNames({ active })}
                      >
                        <Button
                          onClick={() => {
                            ChatStore.update((s) => {
                              s.discussion = channel
                            })
                            sdk?.selectChannel(channel._id)
                          }}
                          type="link"
                        >
                          {channel?.channelName}
                        </Button>
                      </List.Item>
                    )
                  }}
                />
              </>
            )}
          </div>
        </Sider>
        <Layout className={styles.channelContent}>
          {discussion && (
            <div className="header-discussion">
              <Button
                type="link"
                icon={<DropDownIcon />}
                className={styles.backButton}
                onClick={() => {
                  ChatStore.update((s) => {
                    s.discussion = null
                  })
                  sdk?.selectChannel('main')
                }}
              >
                <div className="h-caps-xs h-bold">
                  <Trans>Back to Channel</Trans>
                </div>
              </Button>
              <h3 className="h-m">{discussion?.channelName}</h3>
            </div>
          )}
          {router.query?.forum && (
            <DSCIframe roomId={router.query.forum} discussion={discussion} />
          )}
        </Layout>
      </Layout>
    </div>
  )
}

export default ForumView
