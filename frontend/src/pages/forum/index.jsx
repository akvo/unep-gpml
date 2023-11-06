import React, { useCallback, useEffect, useState } from 'react'
import { Card, List } from 'antd'
import dynamic from 'next/dynamic'
import styles from './index.module.scss'
import Button from '../../components/button'
import { UIStore } from '../../store'
import api from '../../utils/api'
import ForumMembers from '../../modules/forum/forum-members'
import { Trans, t } from '@lingui/macro'

const DynamicForumModal = dynamic(
  () => import('../../modules/forum/forum-modal'),
  {
    ssr: false, // modal has window object that should be run in client side
  }
)

const DynamicMyForum = dynamic(() => import('../../modules/forum/my-forums'), {
  ssr: false, // my forums has window object to update the joins localStorage
})

const Forum = ({ isAuthenticated, loadingProfile, setLoginVisible }) => {
  const [allForums, setAllForums] = useState([])
  const [viewModal, setViewModal] = useState({
    open: false,
    data: {},
  })
  const [loading, setLoading] = useState(true)

  const profile = UIStore.useState((s) => s.profile)

  useEffect(() => {
    if (!loadingProfile && !isAuthenticated) {
      setLoading(false)
      setLoginVisible(true)
    }
  }, [isAuthenticated, loadingProfile])

  const handleOnView = (data) => {
    setViewModal({
      open: true,
      data,
    })
  }

  const getAllForums = useCallback(async () => {
    try {
      /**
       * Waiting for id_token ready by checking profile state
       */
      if (profile?.id) {
        const { data } = await api.get('/chat/channel/all')
        const _allForums = data
          ?.sort((a, b) => {
            // Sort public first
            if (a.t === 'c' && b.type !== 'c') {
              return -1
            } else if (a.t !== 'c' && b.t === 'c') {
              return 1
            } else {
              return 0
            }
          })
          ?.map((d) => ({ ...d, membersFetched: false }))
        setAllForums(_allForums)
        setLoading(false)
      }
    } catch (error) {
      console.error('err', error)
      setLoading(false)
    }
  }, [profile])

  const activateRocketChat = useCallback(async () => {
    if (profile?.id && profile?.chatAccountStatus !== 'active') {
      UIStore.update((s) => {
        s.profile = {
          ...s.profile,
          chatAccountStatus: 'active',
        }
      })
      try {
        await api.post('/chat/user/account')
      } catch (error) {
        console.error('RC activation failed:', error)
      }
    }
  }, [profile?.chatAccountStatus])

  useEffect(() => {
    activateRocketChat()
  }, [activateRocketChat])

  useEffect(() => {
    getAllForums()
  }, [getAllForums])

  return (
    <div className="container">
      <div className={styles.forumHome}>
        <span className="h-xs title">
          <Trans>Forums</Trans>
        </span>
        <DynamicMyForum {...{ handleOnView }} />

        <div className="header">
          <div className="jumbotron">
            <h2>
              <Trans>All Forums</Trans>
            </h2>
            <p className="h-xs">
              <Trans>
                Engage in forums across a wide variety of subjects and sectors
                currently ongoing. Join the public channels or request to join
                the private channels.
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
                    <ForumMembers forum={item} />
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
        <DynamicForumModal {...{ viewModal, setViewModal, allForums }} />
      </div>
    </div>
  )
}

export default Forum
