import React from 'react'
import styles from './index.module.scss'
import { Avatar, Button, Card, Form, Input, List } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const Forum = () => {
  const data = [
    {
      title: 'Title 1',
    },
    {
      title: 'Title 2',
    },
    {
      title: 'Title 3',
    },
    {
      title: 'Title 4',
    },
  ]
  return (
    <div className="container">
      <div className={styles.forumHome}>
        <div className="header">
          <div>
            <h6 className="h-xs">FORUM CHAT</h6>
          </div>
          <div className="jumbotron">
            <h2>Forum Home</h2>
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
          <h5>GPML Forums</h5>
          <List
            grid={{ gutter: 8, column: 3 }}
            dataSource={data}
            renderItem={(item) => (
              <List.Item>
                <Card>
                  <div className="flex">
                    <div>
                      <Avatar size="large">KS</Avatar>
                    </div>
                    <div>
                      <Button size="small" ghost>
                        Request to join
                      </Button>
                    </div>
                  </div>
                  <div className="channel">
                    <h6>{item.title}</h6>
                    <p className="h-xs">Public</p>
                  </div>
                  <div className="flex">
                    <div className="participants">
                      <span className="h-xxs">Participants</span>
                      <h6 className="count">+ 32</h6>
                    </div>
                    <div className="last_message">
                      <span className="h-xxs">Last Message On</span>
                      <p className="h-xxs">Oct 10th, 2023, 1:23pm</p>
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
