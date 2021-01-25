import React, { useEffect, useState } from 'react'
import { Card, DatePicker, Input, Select, Checkbox, Button, Dropdown, Tag } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import './styles.scss'
import { topicTypes } from '../../utils/misc'
import { useLocation, withRouter } from 'react-router-dom'
import moment from 'moment'
import api from '../../utils/api'
import { countries } from 'countries-list'
import countries3to2 from 'countries-list/dist/countries3to2.json'
import ShowMoreText from 'react-show-more-text'

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

const Browse = ({ history }) => {
  const query = useQuery()
  const [countryOpts, setCountryOpts] = useState([])
  const [results, setResults] = useState([])
  const location = useLocation()
  const [relations, setRelations] = useState([])

  const getResults = () => {
    api.get(`/browse${window.location.search}`)
    .then((resp) => {
      setResults(resp?.data?.results)
    })
  }
  useEffect(() => {
    api.get(`/browse${location.search}`)
    .then((resp) => {
      setResults(resp?.data?.results)
    })
    api.get('/country')
    .then((resp) => {
      setCountryOpts(resp.data.map(it => ({ value: it.isoCode, label: it.name })))
    })
  }, [])
  const updateQuery = (param, value) => {
    const newQuery = {...query}
    newQuery[param] = value
    const newParams = new URLSearchParams(newQuery)
    history.push(`/browse?${newParams.toString()}`)
    clearTimeout(tmid)
    tmid = setTimeout(getResults, 1000)
  }
  const handleRelationChange = (relation) => {
    const relationIndex = relations.findIndex(it => it.topicId === relation.topicId)
    if(relationIndex !== -1){
      setRelations([...relations.slice(0, relationIndex), relation, ...relations.slice(relationIndex + 1)])
    }
    else {
      setRelations([...relations, relation])
    }
    api.post('/portfolio', relation)
  }
  return (
    <div id="browse">
      <div className="ui container">
        <aside>
          <div className="inner">
            <Input value={query.q} className="src" placeholder="Search for topics" suffix={<SearchOutlined />} onChange={({ target: { value }}) => updateQuery('q', value)} />
            <div className="field">
              <div className="label">
                Country
              </div>
              <Select value={query.country} placeholder="Find country" mode="multiple" options={countryOpts} allowClear onChange={val => updateQuery('country', val)} />
            </div>
            <div className="field">
              <div className="label">Topics</div>
              <TopicSelect value={query.topic} onChange={val => updateQuery('topic', val)} />
            </div>
            {query.topic.indexOf('event') !== -1 && (
              <div className="event-fields">
                <div className="label">Date range</div>
                <div className="date-range">
                  <DatePicker.RangePicker />
                </div>
                <div className="label">Event location</div>
                <Input />
                <div className="label">Tags</div>
                <Input />
                <div className="label">Event language</div>
                <Input />
              </div>
            )}
          </div>
        </aside>
        <div className="main-content">
          {results.map(result => <Result {...{result, handleRelationChange, relations}} />)}
        </div>
      </div>
    </div>
  )
}

const TopicSelect = ({ value, onChange }) => {
  const handleChange = (type) => ({target: {checked}}) => {
    if (checked && value.indexOf(type) === -1) {
      onChange([...value, type])
    } else if(!checked && value.indexOf(type) !== -1){
      onChange(value.filter(it => it !== type))
    }
  }
  return (
    <ul className="topic-list">
      {topicTypes.map(type =>
        <li key={type}><Checkbox checked={value.indexOf(type) !== -1} onChange={handleChange(type)}>{type}</Checkbox></li>
      )}
    </ul>
  )
}

const Result = ({ result, relations, handleRelationChange }) => {
  const description = result.description || result.abstract || result.summary
  const relation = relations.find(it => it.topicId === result.id)
  return (
    <Card className="result">
      <h4>{result.title || result.name}</h4>
      <div className="type">{result.type}</div>
      <ul className="stats">
        {result.geoCoverageType && <li>{result.geoCoverageType}</li>}
        {result.geoCoverageCountries && <li>{result.geoCoverageCountries.map(it => countries[countries3to2[it]]?.name).join(', ')}</li>}
        {result.status && <li><span>Status:</span>{result.status}</li>}
        {result.organisationType && <li><span>Org:</span>{result.organisationType}</li>}
        {result.yearFounded && <li><span>Founded:</span>{result.yearFounded}</li>}
        {result.developmentStage && <li><span>Stage:</span>{result.developmentStage}</li>}
        {result.value && <li><span>Value:</span>{result.valueCurrency && <i>{result.valueCurrency}</i>}{String(result.value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</li>}
        {result.type === 'event' && [<li><span>Starts:</span><i>{moment(result.startDate).format('DD MMM YYYY')}</i></li>, <li><span>Ends:</span><i>{moment(result.endDate).format('DD MMM YYYY')}</i></li>]}
      </ul>
      {description && <p><ShowMoreText lines={5}>{description}</ShowMoreText></p>}
      <PortfolioBar topic={result} {...{ handleRelationChange, relation }} />
    </Card>
  )
}

const relationsByTopicType = {
  resource: ['owner', 'reviewer', 'user', 'interested in', 'other'],
  technology: ['owner', 'user', 'reviewer', 'interested in', 'other'],
  event: ['resource person', 'organiser', 'participant', 'sponsor', 'host', 'interested in', 'other'],
  project: ['owner', 'implementor', 'reviewer', 'user', 'interested in', 'other'],
  policy: ['regulator', 'implementor', 'reviewer', 'interested in', 'other']
}

const PortfolioBar = ({ topic, relation, handleRelationChange }) => {
  const handleChangeRelation = (relationType) => ({ target: { checked } }) => {
    let association = relation ? [...relation.association] : []
    if(checked) association = [...association, relationType]
    else association = association.filter(it => it !== relationType)
    handleRelationChange({ topicId: topic.id, association, topic: topic.type })
  }
  return (
    <div className="portfolio-bar">
      <Dropdown overlay={(
        <ul className="relations-dropdown">
          {relationsByTopicType[topic.type].map(relationType =>
          <li>
            <Checkbox checked={relation && relation.association && relation.association.indexOf(relationType) !== -1} onChange={handleChangeRelation(relationType)}>{relationType}</Checkbox>
          </li>)}
        </ul>
      )} trigger={['click']}>
        <Button size="small" icon={<PlusOutlined />} shape="round" />
      </Dropdown>
      {(!relation || relation.association.length === 0) && <div className="label">Favorites</div>}
      {relation?.association?.map(relationType => <Tag color="blue">{relationType}</Tag>)}
    </div>
  )
}

export default withRouter(Browse)
