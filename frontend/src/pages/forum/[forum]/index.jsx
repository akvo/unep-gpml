import React, { useCallback, useEffect, useState, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Button, Layout, List, Avatar } from 'antd'
import { Trans } from '@lingui/macro'
import classNames from 'classnames'

import styles from './index.module.scss'
import { DropDownIcon } from '../../../components/icons'
import api from '../../../utils/api'

const { Sider } = Layout

const ForumView = ({ isAuthenticated, profile }) => {
  const router = useRouter()
  const [activeForum, setActiveForum] = useState(null)
  const [sdk, setSDK] = useState(null)
  const [discussion, setDiscussion] = useState(null)
  const [userJoined, setUserJoined] = useState(false)

  const { chatAccountAuthToken: accessToken, chatAccountId: uuid } =
    profile || {}

  const iframeURL = useMemo(() => {
    if (!router.query?.forum) {
      return null
    }
    return accessToken
      ? `${process.env.NEXT_PUBLIC_DSC_URL}/${router.query.forum}?accessToken=${accessToken}`
      : `${process.env.NEXT_PUBLIC_DSC_URL}/${router.query.forum}?uuid=${uuid}`
  }, [router.query?.forum, accessToken, uuid])

  const fetchData = useCallback(async () => {
    try {
      if (profile?.id && router.query?.forum) {
        const { data: apiData } = await api.get(
          `/chat/channel/details/${router.query.forum}`
        )
        const { channel: _activeForum } = apiData || {}
        setActiveForum(_activeForum)
      }
    } catch (error) {
      console.error(error)
    }
  }, [isAuthenticated, profile, router.query?.forum])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    ;(async () => {
      // DSChatSDK construction accepts two parameters:
      // 1. Chat Room Id
      // 2. ID of the iFrame tag
      // 3. Dead Simple Chat Public API Key.
      try {
        if (window?.DSChatSDK && activeForum && !sdk) {
          const _sdk = new window.DSChatSDK(
            activeForum.id,
            'chat-frame',
            process.env.NEXT_PUBLIC_DSC_PUBLIC_KEY
          )
          // Call the connect method to connect the SDK to the Chat iFrame.
          await _sdk.connect()

          if (activeForum.enableChannels) {
            const { channels } = await _sdk.getActiveChannels()
            setActiveForum({
              ...activeForum,
              discussions: channels.map((c) => ({ ...c, name: c.channelName })),
            })
          }
          setSDK(_sdk)
        }
      } catch (error) {
        console.error('SDK', error)
      }
    })()
  }, [activeForum, sdk])
  useEffect(() => {
    console.log('aloooo', userJoined)
    if (sdk != null) {
      sdk.loadCustomization({
        hideSidebar: true,
        hideHeader: true,
        hideChatInputTextArea: !userJoined,
      })
    }
  }, [sdk, userJoined])

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
            {activeForum?.discussions?.length > 0 && (
              <>
                <h6 className="h-caps-xs w-bold">
                  <Trans>Discussions</Trans>
                </h6>
                <List
                  className="discussions"
                  dataSource={activeForum.discussions}
                  renderItem={(discuss, dx) => {
                    const active = discussion?.dx === dx
                    return (
                      <List.Item key={dx} className={classNames({ active })}>
                        <Button
                          onClick={async () => {
                            setDiscussion({
                              ...discuss,
                              dx,
                            })
                            sdk?.selectChannel(discuss?._id)
                          }}
                          type="link"
                          disabled={!discuss?._id}
                        >
                          {discuss?.name}
                        </Button>
                      </List.Item>
                    )
                  }}
                />
              </>
            )}
            {activeForum?.users?.length > 0 && (
              <>
                <h6 className="w-bold h-caps-xs">
                  <Trans>Participants</Trans>
                </h6>
                <List
                  className="members"
                  dataSource={activeForum.users}
                  renderItem={(user) => {
                    const fullName = `${user?.firstName} ${
                      user?.lastName || ''
                    }`
                    return (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar src={user?.picture}>{fullName}</Avatar>
                          }
                          title={fullName}
                          description={user?.org?.name}
                        />
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
                  setDiscussion(null)
                  sdk?.selectChannel('main')
                }}
              >
                <div className="h-caps-xs h-bold">
                  <Trans>Back to Channel</Trans>
                </div>
              </Button>
              <h3 className="h-m">{discussion?.name}</h3>
            </div>
          )}
          {iframeURL && (
            <iframe
              id="chat-frame"
              src={iframeURL}
              width="100%"
              className={classNames({
                discussion,
                joined: userJoined && activeForum != null,
              })}
            />
          )}
          {!userJoined && activeForum !== null && (
            <div className="join-container">
              <Button type="primary" className="noicon">
                Join Channel
              </Button>
            </div>
          )}
        </Layout>
      </Layout>
    </div>
  )
}

export default ForumView
