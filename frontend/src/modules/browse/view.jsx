import React, { useEffect, useState } from 'react'
import { Card, Input, Select, Checkbox, Button, Dropdown, Tag } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import './styles.scss'
import { topicTypes, topicTypesApprovedUser, topicNames, resourceTypeToTopicType } from '../../utils/misc'
import { useLocation, withRouter } from 'react-router-dom'
import moment from 'moment'
import api from '../../utils/api'
import { countries } from 'countries-list'
import countries3to2 from 'countries-list/dist/countries3to2.json'
import countries2to3 from 'countries-list/dist/countries2to3.json'
import ShowMoreText from 'react-show-more-text'
import ModalWarningUser from '../../utils/modal-warning-user'
import { useAuth0 } from '@auth0/auth0-react'
import humps from 'humps'
import isEmpty from 'lodash/isEmpty'
import { LoadingOutlined } from '@ant-design/icons';

function useQuery() {
  const srcParams = new URLSearchParams(useLocation().search);
  const ret = {
    country: [], topic: [], q: ''
  }
  for (var key of srcParams.keys()) {
    ret[key] = srcParams.get(key).split(',').filter(it => it !== '')
  }
  return ret
}

let tmid

const Browse = ({ history, countData, profile, setSignupModalVisible}) => {
  const query = useQuery()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCountries, setFilterCountries] = useState([])
  const location = useLocation()
  const [relations, setRelations] = useState([])
  const {isAuthenticated, loginWithPopup } = useAuth0();
  const [warningVisible, setWarningVisible] = useState(false)
  const isApprovedUser = profile?.reviewStatus === 'APPROVED'
  const getResults = () => {
    // NOTE: This needs to be window.location.search because of how of
    // how `history` and `location` are interacting!
    setLoading(true)
    api.get(`/browse${window.location.search}`)
    .then((resp) => {
      setResults(resp?.data?.results)
      setLoading(false)
    })
  }
  useEffect(() => {
    setLoading(true)
    api.get(`/browse${location.search}`)
    .then((resp) => {
      setResults(resp?.data?.results)
      setLoading(false)
    })
    // NOTE: Since we are using `history` and `location`, the
    // dependency needs to be []. Ignore the linter warning, because
    // adding a dependency here on location makes the FE send multiple
    // requests to the backend.
  }, []) // eslint-disable-line
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
  const updateQuery = (param, value) => {
    const newQuery = {...query}
    newQuery[param] = value
    const newParams = new URLSearchParams(newQuery)
    history.push(`/browse?${newParams.toString()}`)
    clearTimeout(tmid)
    tmid = setTimeout(getResults, 1000)
    if (param === 'country') {
      setFilterCountries(value)
    }
  }
  const handleRelationChange = (relation) => {
    api.post('/favorite', [relation]).then(res => {
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
  const tTypes = isApprovedUser ? topicTypesApprovedUser : topicTypes
  const topicCounts = tTypes.reduce((acc, topic) => {
    const data = Object()
    if (filterCountries.length === 0) {
      data[topic] = countData?.summary?.find(it => it.hasOwnProperty(topic))?.[topic]
    } else {
      // FIXME: The counts would be incorrect if the countries have common resources which are transnational - those would be double counted!
      // FIXME: Also, we display global and regional resources, but those are not included in the counts.
      const count = filterCountries.reduce((acc, isoCode) => acc + countData?.map?.find(it => it.isoCode === isoCode)?.[topic], 0)
      data[topic] = count
    }
    return {...acc, ...data}
  }, {})

  return (
    <div id="browse">
      <div className="ui container">
        <aside>
          <div className="inner">
            <Input value={query.q} className="src" placeholder="Search for resources" suffix={<SearchOutlined />} onChange={({ target: { value }}) => updateQuery('q', value)} />
            <div className="field">
              <div className="label">
                Country
              </div>
              <Select value={query.country} placeholder="Find country" mode="multiple" options={Object.keys(countries).map(iso2 => ({ value: countries2to3[iso2], label: countries[iso2].name })).sort((a, b) => a.label.localeCompare(b.label))} allowClear onChange={val => updateQuery('country', val)} filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}/>
              {isAuthenticated && <Checkbox className="my-favorites" checked={query?.favorites?.indexOf("true") > -1}  onChange={({ target: { checked }}) => updateQuery('favorites', checked)}>My Bookmarks</Checkbox>}
            </div>
            <div className="field">
              <div className="label">Resources</div>
              <TopicSelect counts={topicCounts} isApprovedUser={isApprovedUser} value={query.topic} onChange={val => updateQuery('topic', val)} />
            </div>
          </div>
        </aside>
        <div className="main-content">
          {loading
              ? <h2 className="loading"><LoadingOutlined spin/> Loading</h2>
              : (isEmpty(results)
                  ? <h2 className="loading">There is no data to display</h2>
                  : results.map(result => <Result key={`${result.type}-${result.id}`} {...{result, handleRelationChange, relations, profile}} />))}
        </div>
      </div>
      <ModalWarningUser visible={warningVisible} close={() => setWarningVisible(false)}/>
    </div>
  )
}

const TopicSelect = ({ value, onChange, counts, isApprovedUser }) => {
  const handleChange = (type) => ({target: {checked}}) => {
    if (checked && value.indexOf(type) === -1) {
      onChange([...value, type])
    } else if(!checked && value.indexOf(type) !== -1){
      onChange(value.filter(it => it !== type))
    }
  }
  const tTypes = isApprovedUser ? topicTypesApprovedUser : topicTypes
  return (
    <ul className="topic-list">
      {tTypes.map(type =>
        <li key={type}><Checkbox checked={value.indexOf(humps.decamelize(type)) !== -1} onChange={handleChange(humps.decamelize(type))}>{topicNames(type)} ({(counts && counts[type]) || 0})</Checkbox></li>
      )}
    </ul>
  )
}

const Result = ({ result, relations, handleRelationChange, profile }) => {
  const fullName = (data) => data.title ? `${data.title} ${data.firstName} ${data.lastName}` : `${data.firstName} ${data.lastName}`
  const title = (result.type === 'stakeholder' && fullName(result)) || result.title || result.name
  const description = result.description || result.abstract || result.summary || result.about
  const relation = relations.find(it => it.topicId === result.id && it.topic === resourceTypeToTopicType(result.type))
  const allowBookmark = result.type !== 'stakeholder' || profile.id !== result.id
  return (
    <Card className="result fade-in">
      <h4>{title}</h4>
      <div className="type">{topicNames(result.type)}</div>
      <ul className="stats">
        {result.geoCoverageType && <li>{result.geoCoverageType}</li>}
        {result.geoCoverageValues && <li>{result.geoCoverageValues.map(it => countries[countries3to2[it]]?.name || it).join(', ')}</li>}
        {result.status && <li><span>Status:</span>{result.status}</li>}
        {result.organisationType && <li><span>Org:</span>{result.organisationType}</li>}
        {result.yearFounded && <li><span>Founded:</span>{result.yearFounded}</li>}
        {result.developmentStage && <li><span>Stage:</span>{result.developmentStage}</li>}
        {result.value && <li><span>Value:</span>{result.valueCurrency && <i>{result.valueCurrency}</i>}{String(result.value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</li>}
        {result.type === 'event' && [<li><span>Starts:</span><i>{moment(result.startDate).format('DD MMM YYYY')}</i></li>, <li><span>Ends:</span><i>{moment(result.endDate).format('DD MMM YYYY')}</i></li>]}
      </ul>
      {description && <ShowMoreText lines={5}>{description}</ShowMoreText>}
      {allowBookmark && <PortfolioBar topic={result} {...{ handleRelationChange, relation }} />}
    </Card>
  )
}

const relationsByTopicType = {
  resource: ['owner', 'reviewer', 'user', 'interested in', 'other'],
  technology: ['owner', 'user', 'reviewer', 'interested in', 'other'],
  event: ['resource person', 'organiser', 'participant', 'sponsor', 'host', 'interested in', 'other'],
  project: ['owner', 'implementor', 'reviewer', 'user', 'interested in', 'other'],
  policy: ['regulator', 'implementor', 'reviewer', 'interested in', 'other'],
  stakeholder: ['interested in', 'other'],
}

const PortfolioBar = ({ topic, relation, handleRelationChange }) => {
  const handleChangeRelation = (relationType) => ({ target: { checked } }) => {
    let association = relation ? [...relation.association] : []
    if(checked) association = [...association, relationType]
    else association = association.filter(it => it !== relationType)
    handleRelationChange({ topicId: topic.id, association, topic: resourceTypeToTopicType(topic.type) })
  }
  return (
    <div className="portfolio-bar">
      <Dropdown overlay={(
        <ul className="relations-dropdown">
          {relationsByTopicType[resourceTypeToTopicType(topic.type)].map(relationType =>
          <li key={`${relationType}`}>
            <Checkbox checked={relation && relation.association && relation.association.indexOf(relationType) !== -1} onChange={handleChangeRelation(relationType)}>{relationType}</Checkbox>
          </li>)}
        </ul>
      )} trigger={['click']}>
        <Button size="small" icon={<PlusOutlined />} shape="round" />
      </Dropdown>
      {(!relation || relation.association.length === 0) && <div className="label">Bookmarks</div>}
      {relation?.association?.map((relationType, index) => <Tag color="blue" key={`relation-${index}`}>{relationType}</Tag>)}
    </div>
  )
}

export default withRouter(Browse)
