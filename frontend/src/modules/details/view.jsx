import { LoadingOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Tag, Image, Divider, Dropdown, Checkbox } from 'antd'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { topicNames, resourceTypeToTopicType, relationsByTopicType } from '../../utils/misc'
import { useAuth0 } from '@auth0/auth0-react'
import { languages, countries } from 'countries-list'
import ModalWarningUser from '../../utils/modal-warning-user'
import countries3to2 from 'countries-list/dist/countries3to2.json'
import capitalize from 'lodash/capitalize';
import some from 'lodash/some';
import './styles.scss'
import { typeOfActionKeys, detailMaps, infoMaps, descriptionMaps } from './mapping';
import values from 'lodash/values';
import moment from 'moment';

const renderTypeOfActions = (params, data) => {
  const keys = typeOfActionKeys.map(x => x.key);
  const keyAvailable = keys.map(x => some(data, x)).includes(true);

  if (!keyAvailable || params.type !== 'project') {
    return;
  }

  return (
    <div className="card">
      <h3>Type of Actions</h3>
      <div className="table-actions">
        { 
          typeOfActionKeys.map((item, index) => {
            const { key, name, value, child } =  item;
            return data[key] &&
              <>
              <div className="column">
                <div className="title">{name}</div>
                {
                  (value === 'children') && 
                    <ul>{ data[key].map((value, index) => (<li className="value" key={index}>{(!value) ? '-' : value.name}</li>)) }</ul>
                }

                {
                  (value === 'custom') &&
                    <ul>
                      {
                        child && child.map((child, index) => {
                          const { key, name, value } = child;
                          return (<li className="value" key={index}>{name} : {data[key][value]}</li>)
                        })
                      }
                    </ul>
                }
              </div>
              {(index !== typeOfActionKeys.length - 1) && <Divider />}
              </>
          })
        }
      </div>
    </div>
  )
}

const Excerpt = ({ content, max = 40 }) => {
  if (content.length > max) return `${content.substr(0, max)}...`
  return content
}

const renderDetails = (params, data) => {
  const details = detailMaps[params.type];
  if (!details) {
    return;
  }
  return(
    <div className="card">
      <h3>{topicNames(params.type)} Detail</h3>
      <div className="table">
        { 
          details && details.map((detail, index) => {
            const { key, name, value, type, customValue } = detail;
            return (
              <>
              {
                (data[key] || ((value === 'countries') && (data.geoCoverageType))) && 
                  <div className="column">
                    <div className="title">{ name }</div>
                    <div className="value">
                      { params.type === 'project' && (value === key) && (type === 'name') && data[value].name }
                      { params.type !== 'project' && (value === key) && (type === 'name') && data[value] }
                      { (value === key) && (type === 'text') && capitalize(data[value]) }
                      { (value === key) && (type === 'number') && capitalize(data[value]) }
                      { (value === key) && (type === 'currency') && 'USD ' + data[value] }
                      { (value === key) && (type === 'date') && moment(data[value]).format('DD MMM YYYY')}
                      { params.type === 'project' && data[key] && (value === 'join') && (type === 'array') && data[key].map(x => x.name).join(', ') }
                      { params.type !== 'project' && data[key] && (value === 'join') && (type === 'array') && data[key].join(', ') }
                      { 
                        data[key] && (value === 'isoCode') && (type === 'array') && 
                          data[key].map((x,i) => {
                            const lang = languages[x.isoCode].name
                            return (
                              <>
                              <a target="_blank" href={x.url}>{lang}</a>
                              {(i !== data[key].length - 1) && ", "}
                              </>
                            )
                          })
                      }
                      {
                        (value === 'countries') && (data[key] === null || data[key][0] === '***') && (data.geoCoverageType === 'global') &&
                          <Excerpt content={values(countries).map(c => c.name).join(', ')} max={300} />
                      }
                      {
                        (value === 'countries') && (data[key] !== null) && (data.geoCoverageType !== 'global') &&
                          data[key].map(x => countries[countries3to2[x]].name).join(', ')
                      }
                      {
                        (value === 'custom') && (type === 'currency') &&
                          customValue.map(x => data[x]).join(' ')
                      }
                      {
                        (params.type === 'project' && value === 'custom') && (type === 'array') &&
                          data[key][customValue] && data[key][customValue].map(x => x.name).join(', ')
                      }
                      {
                        (params.type !== 'project' && value === 'custom') && (type === 'array') &&
                          data[key][customValue] && data[key][customValue].join(', ')
                      }
                      {
                        (value === 'custom') && (type === 'object') &&
                          data[key][customValue]
                      }
                      {
                        (value === 'custom') && (type === 'haveChild') &&
                          <ul>
                          {
                            data[key].map((x,i) => {
                              return (
                                <>
                                  <li>{x.name}
                                    <ul>{ x.options.length > 0 && x.options.map((y,i) => <li>{y.name}</li>) }</ul>
                                  </li>
                                </>
                              )
                            })
                          }
                          </ul>
                      }
                    </div>
                  </div>
              }
              {(data[key] || ((value === 'countries') && (data.geoCoverageType))) && (index !== details.length - 1) && <Divider />}
              </>
            )
          })          
        }
      </div>
    </div>
  )
}

const renderInfo = (params, data) => {
  const info = infoMaps[params.type];
  if (!info) {
    return;
  }
  return (
    <div className="card">
      <h3>Related Info And Contacts</h3>
      <div className="table">
        {
          info.map((item, index) => {
            const { key, name, value, type } = item;
            return (
              <div className="column">
                <div className="title">{ name }</div>
                <div className="value">
                  { 
                    data[key] && (value === 'link') && (type === 'array') && 
                      data[key].map((x,i) => {
                        return (
                          <>
                          <a target="_blank" href='#' style={{ wordBreak: 'break-word' }}>{x.name}</a>
                          {(i !== data[key].length - 1) && ", "}
                          </>
                        )
                      })
                  }
                </div>
              </div> 
            )
          })
        }
      </div>
    </div>
  )
}

const renderDescription = (params, data) => {
  const text = descriptionMaps[params.type];
  if (!text) {
    return;
  }
  return (
    <div className="card">
      <h3>{ text.name}</h3>
      {data[text.key] && <p>{data[text.key]}</p>}
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

  useEffect(() => {
    api.get(`/detail/${params.type}/${params.id}`)
    .then((d) => {
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
            <Image style={{marginBottom: '20px'}} width="100%" src={data.image || "/image-not-found.png"} />
            { renderDescription(params, data) }
            { renderTypeOfActions(params, data) }
          </div>

          {/* Right */}
          <div className="content-column">
            { renderDetails(params, data) }
            { renderInfo(params, data) }
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
