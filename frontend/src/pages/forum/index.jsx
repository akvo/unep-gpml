import React, { useCallback, useEffect, useState } from 'react'
import { Card, List } from 'antd'
import dynamic from 'next/dynamic'
import styles from './index.module.scss'
import Button from '../../components/button'
import { ChatStore, UIStore } from '../../store'
import api from '../../utils/api'
import ForumMembers from '../../modules/forum/forum-members'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../translations/utils'
import Head from 'next/head'

const DynamicForumModal = dynamic(
  () => import('../../modules/forum/forum-modal'),
  {
    ssr: false, // modal has window object that should be run in client side
  }
)

const DynamicMyForum = dynamic(() => import('../../modules/forum/my-forums'), {
  ssr: false, // my forums has window object to update the joins localStorage
})

const Forum = ({ isAuthenticated, setLoginVisible }) => {
  const [viewModal, setViewModal] = useState({
    open: false,
    data: {},
  })
  const [loading, setLoading] = useState(true)
  const [preload, setPreload] = useState(true)

  const profile = UIStore.useState((s) => s.profile)
  const allForums = ChatStore.useState((s) => s.allForums)

  const handleOnView = (data) => {
    setViewModal({
      open: true,
      data,
    })
  }

  const getAllForums = useCallback(async () => {
    try {
      ChatStore.update((s) => {
        s.sdk = null
      })
      if (loading && allForums.length) {
        setLoading(false)
        // reset discussion
        ChatStore.update((s) => {
          s.discussion = null
        })
      }
      if (!allForums.length && loading) {
        const { data: apiData } = await api.get('/chat/channel/all')
        const { channels: _allForums } = apiData || {}
        ChatStore.update((s) => {
          // TODO: identify private/public forum
          s.allForums = _allForums
            ?.map((a) => ({
              ...a,
              t: 'c',
              lm: '2024-02-14T15:18:31.220Z',
              users: [],
              membersFetched: false,
            }))
            ?.sort((a, b) => {
              if (a.type === 'c' && b.type !== 'c') {
                return -1
              } else if (a.type !== 'c' && b.type === 'c') {
                return 1
              } else {
                return a.name.localeCompare(b.title)
              }
            })
        })
        ChatStore.update((s) => {
          s.allForums = _allForums
        })
        setLoading(false)
      }
    } catch (error) {
      console.error('err', error)
      setLoading(false)
    }
  }, [loading, allForums])

  const activateChatAccount = useCallback(async () => {
    if (preload && isAuthenticated && !profile?.chatAccountId) {
      setPreload(false)
      try {
        await api.post('/chat/user/account')
        const { data: _profile } = await api.get('/profile')
        UIStore.update((s) => {
          s.profile = _profile
        })
      } catch (error) {
        console.error('Activation failed:', error)
      }
    }
  }, [preload, profile?.chatAccountId, isAuthenticated])

  useEffect(() => {
    activateChatAccount()
  }, [activateChatAccount])

  useEffect(() => {
    getAllForums()
  }, [getAllForums])

  return (
    <>
      <Head>
        {/* HTML Meta Tags */}
        <title>Forums | UNEP GPML Digital Platform</title>
      </Head>
      <div className="container">
        <div className={styles.forumHome}>
          <span className="h-xs title">
            <Trans>Forums</Trans>
          </span>
          {/* <DynamicMyForum {...{ handleOnView }} /> */}

          <div className="header">
            <div className="jumbotron">
              <h2>
                <Trans>All Forums</Trans>
              </h2>
              <p className="h-xs">
                <Trans>
                  Welcome to the Global Partnership on Plastic Pollution and
                  Marine Litter (GPML) Digital Platform forums page. A space
                  where you can interact, network, and share insights and
                  information with other like-minded advocates on issues related
                  to plastic pollution and marine litter strategies, models and
                  methodologies, data harmonization, innovative financing, and
                  Capacity Building. Your voice matters, join now and be part of
                  the wave for change.
                </Trans>
              </p>
            </div>
          </div>
          <section>
            <List
              grid={{ column: 3, gutter: 20 }}
              dataSource={allForums}
              loading={loading}
              renderItem={(item) => (
                <List.Item>
                  <Card>
                    <div className="channel">
                      <span className={styles.forumType}>
                        {item.t === 'p' ? t`private` : t`public`} {t`channel`}
                      </span>
                      <h5>{item.name?.replace(/[-_]/g, ' ')}</h5>
                      <p className={styles.forumDesc}>
                        {item?.description?.substring(0, 120)}
                        {item?.description?.length > 120 && '...'}
                      </p>
                    </div>
                    <div className="flex">
                      {/* <ForumMembers forum={item} /> */}
                      <div>
                        <Button
                          size="small"
                          onClick={() => handleOnView(item)}
                          ghost
                        >
                          <Trans>View</Trans>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </section>
          <DynamicForumModal
            {...{
              viewModal,
              setViewModal,
              allForums,
              setLoginVisible,
              isAuthenticated,
            }}
          />
        </div>
      </div>
    </>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Forum
