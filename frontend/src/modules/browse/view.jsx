import React, { useEffect, useState } from 'react'
import { Card, DatePicker, Input, Select, Checkbox } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import './styles.scss'
import { topicTypes } from '../../utils/misc'
import { useLocation, withRouter } from 'react-router-dom'
import api from '../../utils/api'

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
          {results.map(result => <Result {...{result}} />)}
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
        <li><Checkbox checked={value.indexOf(type) !== -1} onChange={handleChange(type)}>{type}</Checkbox></li>
      )}
    </ul>
  )
}

const Result = ({ result }) => {
  return (
    <Card className="result">
      <h3>{result.title}</h3>
      <div className="type">{result.type}</div>
      <ul className="stats">
        <li>
          {result?.geoCoverageCountries?.join(', ')}
        </li>
      </ul>
      {result.description && <p>{result.description}</p>}
    </Card>
  )
}

export default withRouter(Browse)
