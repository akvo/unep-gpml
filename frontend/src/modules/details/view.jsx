import { GlobalOutlined, LoadingOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Tag } from 'antd'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import api from '../../utils/api'
import { topicNames } from '../../utils/misc'
import { PortfolioBar } from '../browse/view'
import { countries } from 'countries-list'
import countries3to2 from 'countries-list/dist/countries3to2.json'
import './styles.scss'

const DetailsView = ({ match: { params }, ...props }) => {
  const [data, setData] = useState(null)
  useEffect(() => {
    api.get(`/detail/${params.type}/${params.id}`)
    .then((d) => {
      console.log(d.data)
      setData(d.data)
    })
  }, [])
  if(!data) return (
    <div className="details-view">
      <div className="loading">
        <LoadingOutlined spin />
        <i>Loading...</i>
      </div>
    </div>
  )
  return (
    <div className="details-view">
      <div className="bc">
        <div className="ui container">
          <Link to="/browse">All resources</Link>
          <RightOutlined />
          <Link to={`/browse/${params.type}`}>{topicNames(params.type)}</Link>
          <RightOutlined />
          {/* <i>{data.title}</i> */}
        </div>
      </div>
      <div className="ui container">
        <div className="content-container">
          <div className="type-tag">{topicNames(params.type)}</div>
          <ul className="stats">
            {data.geoCoverageType && <li><GlobalOutlined /> {data.geoCoverageType}</li>}
            {data.geoCoverageValues && <li>{data.geoCoverageValues.map(it => countries[countries3to2[it]]?.name || it).join(', ')}</li>}
            {data.typeOfLaw && <li><span>Type:</span>{data.typeOfLaw}</li>}
            {data.status && <li><span>Status:</span>{data.status}</li>}
            {(data.funds != null) && <li><span>Funds:</span>{String(data.funds).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</li>}
            {(data.contribution != null && data.contribution > 0) && <li><span>Contribution:</span>{String(data.contribution).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</li>}
            {data.organisationType && <li><span>Org:</span>{data.organisationType}</li>}
            {data.yearFounded && <li><span>Founded:</span>{data.yearFounded}</li>}
            {data.developmentStage && <li><span>Stage:</span>{data.developmentStage}</li>}
            {data.value && <li><span>Value:</span>{data.valueCurrency && <i>{data.valueCurrency}</i>}{String(data.value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</li>}
            {data.type === 'event' && [<li><span>Starts:</span><i>{moment(data.startDate).format('DD MMM YYYY')}</i></li>, <li><span>Ends:</span><i>{moment(data.endDate).format('DD MMM YYYY')}</i></li>]}
          </ul>
          <h1>{data.title || data.name}</h1>
          {data.url && <a href={data.url} target="_blank" rel="noreferrer"><Button type="primary" ghost size="large">Visit dashboard</Button></a>}
          {data.email && <a href={`mailto:${data.email}`}><Button type="primary" ghost size="large">Send email</Button></a>}
          {data.summary && <p>{data.summary}</p>}
          {data.attachments && data.attachments.length > 0 && (
            <div className="links">
              <span>Links: </span>
              {data.attachments.map(it => <a href={it} target="_blank" rel="noreferrer">{it}</a>)}
            </div>
          )}
          {data.tags && (
            <div className="tags">
              <span>Tags: </span>
              <b>{data.tags.join('; ')}</b>
            </div>
          )}
          {/* <PortfolioBar /> */}
        </div>
      </div>
    </div>
  )
}

export default DetailsView
