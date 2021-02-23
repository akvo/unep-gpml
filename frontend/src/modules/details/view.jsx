import { LoadingOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Tag, Image, Divider, Dropdown, Checkbox } from 'antd'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { topicNames, resourceTypeToTopicType, relationsByTopicType } from '../../utils/misc'
import { useAuth0 } from '@auth0/auth0-react'
import { countries } from 'countries-list'
import ModalWarningUser from '../../utils/modal-warning-user'
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
                  <div className="column" key={`action-${index}`}>
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
  const { profile, setSignupModalVisible } = props;
  const [data, setData] = useState(null)
  const [relations, setRelations] = useState([])
  const { isAuthenticated, loginWithPopup } = useAuth0();
  const [warningVisible, setWarningVisible] = useState(false)
  const relation = relations.find(it => it.topicId === parseInt(params.id) && it.topic === resourceTypeToTopicType(params.type))
  const allowBookmark = params.type !== 'stakeholder' || profile.id !== params.id

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

  useEffect(() => {
    if(isAuthenticated){
      setTimeout(() => {
        api.get('/favorite')
        .then((resp) => {
          setRelations(resp.data)
        })
      }, 100)
    }
  }, [isAuthenticated])

  const handleRelationChange = (relation) => {
    api.post('/favorite', relation).then(res => {
      const relationIndex = relations.findIndex(it => it.topicId === relation.topicId)
      if(relationIndex !== -1){
        setRelations([...relations.slice(0, relationIndex), relation, ...relations.slice(relationIndex + 1)])
      }
      else {
        setRelations([...relations, relation])
      }
    }).catch(err => {
        if (isAuthenticated) {
            if (Object.keys(profile).length === 0) {
                setSignupModalVisible(true);
            } else {
                setWarningVisible(true);
            }
        } else {
            loginWithPopup();
        }
    })
  }

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
          <div className="header-container">
            <div className="title">
              <div className="type-tag"><span className={contentHeaderStyle.topic}>{topicNames(params.type)}</span></div>
              <h1>{data.title || data.name}</h1>
              {relation?.association?.map((relationType, index) => <Tag color="blue" key={`relation-${index}`}>{relationType}</Tag>)}
            </div>
            <div className="bookmark">
              {allowBookmark && <BookmarkBtn topic={params} {...{ handleRelationChange, relation }} />}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="ui container">
        <div className="content-body">
          {/* Left */}
          <div className="content-column">
            <Image style={{marginBottom: '20px'}} width="100%" src="https://via.placeholder.com/600x400" />
            <div className="card">
              <h3>Description</h3>
              {data.summary && <p>{data.summary}</p>}
            </div>

            {content.actions && renderTypeOfActions(content.actions)}
          </div>

          {/* Right */}
          <div className="content-column">
            <div className="card">
              <h3>{topicNames(params.type)} Detail</h3>
              <div className="table">
                  {
                    content.detail.map((item, index) => {
                      return (
                        <>
                          <div className="column" key={`detail-${index}`}>
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
                          <div className="column" key={`info-${index}`}>
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
      <ModalWarningUser visible={warningVisible} close={() => setWarningVisible(false)}/>
    </div>
  )
}

const BookmarkBtn = ({ topic, relation, handleRelationChange }) => {
  const handleChangeRelation = (relationType) => ({ target: { checked } }) => {
    let association = relation ? [...relation.association] : []
    if(checked) association = [...association, relationType]
    else association = association.filter(it => it !== relationType)
    handleRelationChange({ topicId: parseInt(topic.id), association, topic: resourceTypeToTopicType(topic.type) })
  }
  return (
    <div className="portfolio-bar" onClick={e => e.stopPropagation()}>
      <Dropdown overlay={(
        <ul className="relations-dropdown">
          {relationsByTopicType[resourceTypeToTopicType(topic.type)].map(relationType =>
          <li key={`${relationType}`}>
            <Checkbox checked={relation && relation.association && relation.association.indexOf(relationType) !== -1} onChange={handleChangeRelation(relationType)}>{relationType}</Checkbox>
          </li>)}
        </ul>
      )} trigger={['click']}>
        <Button size="large" icon={<PlusOutlined />} shape="circle" />
      </Dropdown>
      <div className="label" style={{color: '#01ABF1', fontWeight: 500}}>Bookmarks</div>
    </div>
  )
}

export default DetailsView
