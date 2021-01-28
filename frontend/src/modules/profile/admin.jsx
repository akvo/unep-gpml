import { Button, Collapse, Space, Spin } from 'antd'
import React from 'react'
import { useEffect, useState } from 'react'
import api from '../../utils/api'
import moment from 'moment'


const AdminSection = () => {
  const [pendingItems, setPendingItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    (async function fetchData() {
      const profileResp = await api.get('/profile/pending');
      const eventResp = await api.get('/event/pending');
      setPendingItems([
        ...profileResp.data.map(it => ({ type: 'profile', ...it, title: `${it.firstName} ${it.lastName}` })),
        ...eventResp.data.map(it => ({ type: 'event', ...it }))
      ])
      setLoading(false)
    })()
  }, [])
  const approve = (item) => () => {
    api.put(`/${item.type}/approve`, { id: item.id })
    .then(() => {
      setPendingItems(pendingItems.filter(it => it.id !== item.id))
    })
  }
  return (
    <div className="admin-view">
      <h2>New approval requests</h2>
      {loading && <Spin size="large" />}
      <div className="row head">
        <div className="col">Type</div>
        <div className="col">Title</div>
        <div className="col">Action</div>
      </div>
      <Collapse>
      {pendingItems.map(item =>
      <Collapse.Panel
        header={
          <div className="row">
            <div className="col">{item.type}</div>
            <div className="col">{item.title}</div>
            <div className="col" onClick={e => { e.stopPropagation() }}>
              <Space size="middle">
                <Button type="primary" onClick={approve(item)}>Approve</Button>
                <Button type="link">Decline</Button>
              </Space>
            </div>
          </div>
        }
      >
        <div>
          {item.type === 'profile' && (
            <div className="stakeholder-info">
              {item.photo && <img src={item.photo} alt="profile" />}
              <ul>
                <li>{item.email}</li>
                <li>{item.about}</li>
                {item.org && <li><a href={item.org.url} target="_blank" rel="noreferrer">{item.org.name}</a></li>}
              </ul>
            </div>
          )}
          {item.type === 'event' && (
            <div className="event-info">
              <ul>
                  <li>{moment(item.startDate).format('DD MMM YYYY')} to {moment(item.endDate).format('DD MMM YYYY')}</li>
                  <li>{item.geoCoverageType} {item.geoCoverageValue}</li>
                  <li>{item.description}</li>
              </ul>
            </div>
          )}
        </div>
      </Collapse.Panel>
      )}
      </Collapse>
    </div>
  )
}

export default AdminSection
