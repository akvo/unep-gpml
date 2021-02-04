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
  const review = (item, review_status) => () => {
    api.put(`/${item.type}/review`, { id: item.id, review_status: review_status})
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
                <Button type="primary" onClick={review(item, "APPROVED")}>Approve</Button>
                <Button type="link" onClick={review(item, "REJECTED")}>Decline</Button>
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
              {item.image && <img src={item.image} alt="event" />}
              {/* TODO fix image url */}
              <ul>
                  <li>Submitted At: {moment(item.createdAt).format('DD MMM YYYY')}</li>
                  <li>Event Date: {moment(item.startDate).format('DD MMM YYYY')} to {moment(item.endDate).format('DD MMM YYYY')}</li>
                  <li>Country: {item.country}</li>
                  <li>City: {item.city}</li>
                  <li>Coverage: <b>{item.geoCoverageType}</b>
                      {item?.geoCoverageValues &&
                        <ul className={'ul-children'}>
                          {item.geoCoverageValues.map((x, i) => <li key={`coverage-${i}`}>{x}</li>)}
                        </ul>
                      }
                  </li>
                  <li>Description: {item.description}</li>
                  <li>Remarks: {item.remarks}</li>
                  {item?.tags &&
                    <li>Tags: {item.tags.map(x => `${x}, `)}</li>
                  }
                  <li>Urls:
                      {item?.urls &&
                        <ul className={'ul-children'}>
                          {item.urls.map((x, i) => <li key={`url-${i}`}>{x.isoCode}: {x.url}</li>)}
                        </ul>
                      }
                  </li>
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
