import { Button, Space, Table } from 'antd'
import React from 'react'
import { useEffect, useState } from 'react'
import api from '../../utils/api'

const { Column, ColumnGroup } = Table;

const AdminSection = () => {
  const [pendingItems, setPendingItems] = useState([])
  useEffect(() => {
    api.get('/profile/pending')
    .then((d) => {
      setPendingItems(d.data.map(it => ({ type: 'stakeholder', id: it.id, title: `${it.firstName} ${it.lastName}` })))
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
    <div>
      <h2>New approval requests</h2>
      <Table dataSource={pendingItems}>
        <Column title="Type" dataIndex="type" key="type" />
        <Column title="Title" dataIndex="title" key="title" />
        <Column
          title="Action"
          key="action"
          render={(text, record) => (
            <Space size="middle">
              <Button type="primary" onClick={approve(record)}>Approve</Button>
              <Button type="link">Decline</Button>
            </Space>
          )}
        />
      </Table>
    </div>
  )
}

export default AdminSection
