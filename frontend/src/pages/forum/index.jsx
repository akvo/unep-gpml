import React from 'react'
import styles from './index.module.scss'
import { Card, Form, Input, List } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import Button from '../../components/button'

const Forum = () => {
  /**
   * TODO
   * will be replaced with the response from API soon.
   */
  const data = [
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
  return (
    <div className="container">
      <div className={styles.forumHome}>
        <div className="header">
          <div>
            <span className="h-xs">Forums</span>
          </div>
          <div className="jumbotron">
            <h2>All Forums</h2>
            <p className="h-xs">
              Engage in forums across a wide variety of subjects and sectors
              currently ongoing. Join the public channels or request to join the
              private channels.
            </p>
          </div>
          <div className="search-form">
            <Form>
              <Form.Item>
                <Input
                  placeholder="Find forums"
                  prefix={<SearchOutlined />}
                  size="large"
                />
              </Form.Item>
            </Form>
          </div>
        </div>
        <section>
          <List
            grid={{ column: 3 }}
            dataSource={data}
            renderItem={(item) => (
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
                    <div className="last_message">
                      {item.isPrivate ? (
                        <Button size="small" ghost>
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

export default Forum
