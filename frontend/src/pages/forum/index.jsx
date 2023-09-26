import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, List } from 'antd'
import styles from './index.module.scss'
import Button from '../../components/button'
import api from '../../utils/api'
import { UIStore } from '../../store'

const Forum = ({ forums }) => {
  const [allForums, setAllForums] = useState(forums)
  const [loader, setLoader] = useState({
    request: false,
  })
  const profile = UIStore.useState((s) => s.profile)

  const DynamicMyForums = dynamic(() => import('./my-forums'), {
    ssr: false,
  })

  const handleRequestToJoin = async (index, name) => {
    // TODO
    /**
     * handle request join response
     */
    setLoader({
      ...loader,
      request: index,
    })
    try {
      const { data } = await api.post('/chat/channel/private', {
        channel_name: name,
      })
      console.log('data', data)
      setLoader({
        ...loader,
        request: false,
      })
    } catch (error) {
      console.error('err', error)
      setLoader({
        ...loader,
        request: false,
      })
    }
  }

  return (
    <div className="container">
      <div className={styles.forumHome}>
        <span className="h-xs title">Forums</span>
        {profile?.id && <DynamicMyForums />}

        <div className="header">
          <div className="jumbotron">
            <h2>All Forums</h2>
            <p className="h-xs">
              Engage in forums across a wide variety of subjects and sectors
              currently ongoing. Join the public channels or request to join the
              private channels.
            </p>
          </div>
        </div>
        <section>
          <List
            grid={{ column: 3 }}
            dataSource={allForums}
            renderItem={(item, ix) => (
              <List.Item>
                <Card>
                  <div className="channel">
                    <span className="h-xs">
                      {item.isPrivate ? 'private' : 'public'}
                    </span>
                    <h5>{item.title}</h5>
                    <p className="description">
                      Description of the forum goes here and on and on
                      describing what it is about in a sentence or two. Which
                      should be enough.
                    </p>
                  </div>
                  <div className="flex">
                    <div className="participants">
                      <h6 className="count">32</h6>
                      <span className="h-xxs">Participants</span>
                    </div>
                    <div>
                      {item.isPrivate ? (
                        <Button
                          size="small"
                          onClick={() => handleRequestToJoin(ix, item.title)}
                          loading={loader.request === ix}
                          ghost
                        >
                          Request to Join
                        </Button>
                      ) : (
                        <Button size="small" withArrow="link" ghost>
                          View Channel
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </section>
      </div>
    </div>
  )
}

Forum.getInitialProps = async () => {
  try {
    const { data: forums } = await api.get('/chat/channel/all')
    return {
      forums,
    }
  } catch {
    const allDummies = [
      {
        title: 'Issue Briefs',
        isPrivate: false,
      },
      {
        title: 'AFRIPAC',
        isPrivate: true,
      },
      {
        title: 'Data Harmonization CoP',
        isPrivate: true,
      },
      {
        title: 'LAC Forum',
        isPrivate: true,
      },
      {
        title: 'Ontology CoP',
        isPrivate: true,
      },
      {
        title: 'CoP on the Harmonization of Plastic Flow',
        isPrivate: true,
      },
      {
        title:
          'CoP to harmonize approaches for informing and enabling action on plastic pollution and marine litter',
        isPrivate: true,
      },
    ]
    return {
      forums: allDummies,
    }
  }
}

export default Forum
