import { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import { Trans } from '@lingui/macro'
import { List, Button } from 'antd'
import { useRouter } from 'next/router'

import styles from '../forum/index.module.scss'
import { loadCatalog } from '../../translations/utils'
import ForumCard from '../../components/forum-card/forum-card'
import ForumMembers from '../../modules/forum/forum-members'
import { ChatStore } from '../../store'

export const mockCallSSO = () => {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          accessToken: process.env.NEXT_PUBLIC_MOCK_DSC_ACCESS_TOKEN,
        }),
      2000
    )
  )
}

const DSCPage = ({ profile }) => {
  const [loading, setLoading] = useState(true)
  const allForums = ChatStore.useState((s) => s.dscForums)
  /**
   * TODO: accessToken should be stored in the BACKEND database
   * to prevent create a new user with the same username when the global state/client storage was removed
   * https://deadsimplechat.com/developer/single-sign-on/sso-using-auth-token#step2-creating-the-user
   */
  const accessToken = ChatStore.useState((s) => s.accessToken)
  const router = useRouter()

  const goToForum = (forum) => {
    router.push(`/forum-dsc/${forum.id}`)
  }

  const fetchData = useCallback(async () => {
    if (allForums.length) {
      setLoading(false)
    } else {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DSC_API_URL}/consumer/api/v1/chatrooms?auth=${process.env.NEXT_PUBLIC_DSC_PRIVATE_KEY}`
        )
        const data = await res.json()
        const forums = data.map((d) => ({
          users_count: 0,
          name: d.name,
          lm: '2024-02-14T15:18:31.220Z',
          ts: '2023-08-14T14:52:31.359Z',
          updated_at: '2024-02-14T15:18:31.308Z',
          msgs: 0,
          id: d.roomId,
          t: 'c', // TODO: identify private/public forum
          users: [],
          avatar_url: null,
        }))
        ChatStore.update((s) => {
          s.dscForums = forums
        })

        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.error('[FORUMS]', error)
      }
    }
  }, [loading, allForums])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleOnSSO = useCallback(async () => {
    if (!accessToken && profile?.email) {
      const { accessToken: _accessToken } = await mockCallSSO()
      ChatStore.update((s) => {
        s.accessToken = _accessToken
      })
    }
  }, [accessToken, profile])

  useEffect(() => {
    handleOnSSO()
  }, [handleOnSSO])

  return (
    <>
      <Head>
        <title>Forums | UNEP GPML Digital Platform</title>
      </Head>
      <div className="container">
        <div className={styles.forumHome}>
          <span className="h-xs title">
            <Trans>Forums</Trans>
          </span>
          {/* MY FORUMS START */}

          {/* MY FORUMS END */}
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
            {/* ALL FORUMS START */}
            <List
              grid={{ column: 3, gutter: 20 }}
              dataSource={allForums}
              loading={loading}
              renderItem={(item) => (
                <List.Item>
                  <ForumCard>
                    <ForumCard.HStack>
                      <ForumCard.Title {...item} />
                    </ForumCard.HStack>
                    <ForumCard.HStack>
                      {item?.isView ? (
                        <ForumMembers forum={item} />
                      ) : (
                        <ForumCard.LastMessage lm={item?.lm} />
                      )}
                      <div>
                        {item?.isView ? (
                          <Button
                            size="small"
                            onClick={() => goToForum(item)}
                            ghost
                          >
                            <Trans>View</Trans>
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            withArrow="link"
                            onClick={() => goToForum(item)}
                          >
                            <Trans>Chat</Trans>
                          </Button>
                        )}
                      </div>
                    </ForumCard.HStack>
                  </ForumCard>
                </List.Item>
              )}
            />
            {/* ALL FORUMS END */}
          </section>
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

export default DSCPage
