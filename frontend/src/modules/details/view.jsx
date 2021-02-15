import { RightOutlined } from '@ant-design/icons'
import { Button, Tag } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import { topicNames } from '../../utils/misc'
import { PortfolioBar } from '../browse/view'
import './styles.scss'

const DetailsView = ({ match: { params }, ...props }) => {
  return (
    <div className="details-view">
      <div className="bc">
        <div className="ui container">
          <Link to="/browse">All resources</Link>
          <RightOutlined />
          <Link to={`/browse/${params.type}`}>{topicNames(params.type)}</Link>
          <RightOutlined />
          <i>Nordic coastal cleanup</i>
        </div>
      </div>
      <div className="ui container">
        <div className="content-container">
          <Tag>Project</Tag>
          <h1>Nordic Coastal Clean Up</h1>
          <Button type="primary" ghost size="large">Visit dashboard</Button>
          <p>
            The Nordic Coastal Clean Up aims to mobilize volunteers across the Nordic region to pick litter along the coast and along rivers and lakes. The network also gathers knowledge about the sources of marine litter in the Nordic countries through monitoring and data collection.
          </p>
          {/* <PortfolioBar /> */}
        </div>
      </div>
    </div>
  )
}

export default DetailsView
