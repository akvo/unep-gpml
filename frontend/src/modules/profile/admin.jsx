import { Button, Collapse, Space } from 'antd'
import React from 'react'
import { useEffect, useState } from 'react'
import api from '../../utils/api'


const AdminSection = () => {
  const [pendingItems, setPendingItems] = useState([])
  useEffect(() => {
    api.get('/profile/pending')
    .then((d) => {
      setPendingItems(d.data.map(it => ({ type: 'stakeholder', ...it, title: `${it.firstName} ${it.lastName}` })))
    })
  }, [])
  const approve = (item) => () => {
    if(item.type === 'stakeholder') {
      api.put('/profile/approve', { id: item.id })
      .then(() => {
        setPendingItems(pendingItems.filter(it => it.id !== item.id))
      })
    }
  }
  return (
    <div className="admin-view">
      <h2>New approval requests</h2>
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
          {item.type === 'stakeholder' && (
            <div className="stakeholder-info">
              {item.photo && <img src={item.photo} />}
              <ul>
                <li>{item.email}</li>
                <li>{item.about}</li>
                {item.org && <li><a href={item.org.url} target="_blank">{item.org.name}</a></li>}
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
