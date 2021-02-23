import { GlobalOutlined, LoadingOutlined, RightOutlined, EnvironmentOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Tag, Tooltip, Image, Divider } from 'antd'
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

const projectStaticData = {
  detail: [
    {
      name: 'Organization',
      value: 'UN-Habitat',
    },
    {
      name: 'Geo-Coverage',
      value: 'Global',
    },
    {
      name: 'Country',
      value: 'Austria, Bangladesh, Burundi, Cameroon, Chad, China, Democratic Republic of Congo, Ethiopia, Germany, Ghana, India,Indonesia, Israel, Japan, Jordan, Kenya, Lao People’s Democratic Republic, Lebanon, Lesotho, Malawi, Malaysia, Mexico, Nepal, Pakistan, Peru, Senegal, Sierra Leone, Slovenia, South Africa, South Sudan, Sri lanka, Tunisia, Uganda, United Republic of Tanzania',
    },
    {
      name: 'Amount Invested',
      value: '$ 500,000',
    },
    {
      name: 'In Kind Contributions',
      value: '$ 300,000',
    },
    {
      name: 'Funding Types',
      value: 'Mixed',
    },
    {
      name: 'Funding Name',
      value: 'JPOs from Italy and Germany. Contribution from foundation',
    },
    {
      name: 'Lifecyle Phase',
      value: 'Design,Production / Manufacture,Use / consumption,Collection / sorting of plastics after use,Management of collected plastics,Clean-up of plastic from the environment',
    }
  ],
  relatedInfo : [
    {
      name: 'Website',
      value: 'ichthion.com/technology/'
    },
  ],
  actions : [
    {
      name: 'Working with people',
      values: ['Encouraging or enabling others (e.g., education, training, communication, awareness raising, behaviour change programmes)']
    },
    {
      name: 'Technology & Processes',
      values: [
        'New technical developments/innovation (e.g., research and development, new product design, new materials, processes etc.)',
        'Changes in practice',
        'Operations',
        'Environmental management and planning',
        'MONITORING and ANALYSIS: Collecting evidence around plastic discharge to the ocean/waterways? (e.g. monitoring, analysis)'
      ]
    }
  ]
} 

const nonProjectStaticData = {
  detail: [
    {
      name: 'Organization Type',
      value: 'Startup',
    },
    {
      name: 'Headquarters',
      value: 'UK',
    },
    {
      name: 'Development Stage',
      value: 'Prototype',
    },
    {
      name: 'Year Founded',
      value: '2017',
    },
    {
      name: 'Languages',
      value: 'English',
    },
    {
      name: 'Tags',
      value: 'waste collection; waste recovery; waste; plastic; funding; partnerships',
    }
  ],
  relatedInfo : [
    {
      name: 'Website',
      value: 'ichthion.com/technology/'
    },
    {
      name: 'Contact',
      value: 'hello@remora-marine.co.uk'
    }
  ]
} 

const renderTypeOfActions = (data) => {
  return (
    <div className="card">
      <h3>Type of Actions</h3>
      <div className="table-actions">
          {
            data.map((item, index) => {
              return (
                <>
                  <div className="column" key={index}>
                    <div className="title">{item.name}</div>
                    <ul>
                    {
                      item.values.map((value, index) => {
                        return (
                          <li className="value" key={index}>{(!value) ? '-' : value}</li>
                        )
                      })
                    }
                    </ul>
                  </div>
                  {(index !== data.length - 1) && <Divider />}
                </>
              )
            })
          }
      </div>
    </div>
  )
}

const DetailsView = ({ match: { params }, ...props }) => {
  const [data, setData] = useState(null)
  const contentHeaderStyle = (params.type === 'project') 
      ? {header: 'content-project', topic: 'project-topic'} : {header: 'content-non-project', topic: 'non-project-topic'};
  const content = (params.type === 'project') ? projectStaticData : nonProjectStaticData;

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
          <Link to={`/browse?topic=${params.type}`}>{topicNames(params.type)}</Link>
          <RightOutlined />
          <span className="details-active">{data.title || data.name}</span>
        </div>
      </div>

      {/* Header */}
      <div className={contentHeaderStyle.header}>
        <div className="ui container">
          <div style={{display:'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{width: '90%'}}>
              <div className="type-tag"><span className={contentHeaderStyle.topic}>{topicNames(params.type)}</span></div>
              <h1>{data.title || data.name}</h1>
            </div>
            {/* <ul className="stats"> */}
              {/*             
              {data.geoCoverageType && <li><span className="label">{data.geoCoverageType} geo coverage{data.geoCoverageValues && ':'}</span>{data.geoCoverageValues && data.geoCoverageValues.map(it => countries[countries3to2[it]]?.name || it).join(', ')}</li>}
              {data.typeOfLaw && <li><span className="label">Type:</span>{data.typeOfLaw}</li>}
              {data.status && <li><span className="label">Status:</span>{data.status}</li>}
              {(data.funds != null) && <li><span className="label">Funds:</span>{String(data.funds).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</li>}
              {(data.contribution != null && data.contribution > 0) && <li><span className="label">Contribution:</span>{String(data.contribution).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</li>}
              {data.organisationType && <li><span className="label">Org:</span>{data.organisationType}</li>}
              {data.yearFounded && <li><span className="label">Founded:</span>{data.yearFounded}</li>}
              {data.developmentStage && <li><span className="label">Stage:</span>{data.developmentStage}</li>}
              {data.value && <li><span className="label">Value:</span>{data.valueCurrency} {String(data.value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} {data.valueRemarks && <small>({data.valueRemarks})</small>}</li>}
              {data.type === 'event' && [<li><span className="label">Starts:</span><i>{moment(data.startDate).format('DD MMM YYYY')}</i></li>, <li><span>Ends:</span><i>{moment(data.endDate).format('DD MMM YYYY')}</i></li>]}
              */}

              {/* <li><span className="label">UN-Habitat</span></li>
              <li><span className="label"><GlobalOutlined /> Global</span></li>
              <li><span className="label"><EnvironmentOutlined /> Austria, Bangladesh, Burundi, Cameroon, Chad, China, Democratic Republic of Congo, Ethiopia, Germany, Ghana, India,Indonesia, Israel,</span><span className="label more">32 more</span></li> */}
            {/* </ul> */}
            <div style={{textAlign: 'center'}}>
              <Button size="large" icon={<PlusOutlined style={{color: 'white'}} />} shape="circle" style={{backgroundColor:'#01ABF1'}} /> 
              <div style={{color: '#01ABF1', fontWeight: 500}}>Bookmarks</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ui container">
        {/* <div className="content-container"> */}
          {/* <div className="big-btns">
            {data.url && <a href={data.url} target="_blank" rel="noreferrer"><Button type="primary" ghost size="large">Visit website</Button></a>}
            {params.type === 'project' && <a href="https://unep.tc.akvo.org" target="_blank" rel="noreferrer"><Button type="primary" ghost size="large">Visit dashboard</Button></a>}
            {data.email && <a href={`mailto:${data.email}`}><Button type="primary" ghost size="large">Contact</Button></a>}
          </div>
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
          )} */}
        {/* </div> */}
        
        <div className="content-body">
          <div className="content-column">
            <Image style={{marginBottom: '20px'}} width="100%" src="https://via.placeholder.com/600x400" />
            <div className="card">
              <h3>Description</h3>
              {data.summary && <p>{data.summary}</p>}
            </div>

            {content.actions && renderTypeOfActions(content.actions)}
            
          </div>

          <div className="content-column">
            <div className="card">
              <h3>{topicNames(params.type)} Detail</h3>
              <div className="table">
                  {
                    content.detail.map((item, index) => {
                      return (
                        <>
                          <div className="column" key={index}>
                            <div className="title">{item.name}</div>
                            <div className="value">{(!item.value) ? '-' : item.value}</div>
                          </div>
                          {(index !== content.detail.length - 1) && <Divider />}
                        </>
                      )
                    })
                  }
              </div>
            </div>

            <div className="card">
              <h3>Related Info And Contacts</h3>
              <div className="table">
                  {
                    content.relatedInfo.map((item, index) => {
                      return (
                        <>
                          <div className="column" key={index}>
                            <div className="title">{item.name}</div>
                            <div className="value">{item.value}</div>
                          </div>
                          {(index !== content.relatedInfo.length - 1) && <Divider />}
                        </>
                      )
                    })
                  }
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default DetailsView
