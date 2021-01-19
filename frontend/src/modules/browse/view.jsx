import React, { useEffect, useState } from 'react'
import { Card, Input, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import axios from 'axios'
import './styles.scss'
import { topicTypes } from '../../utils/misc'
import { useLocation, withRouter } from 'react-router-dom'

function useQuery() {
  const srcParams = new URLSearchParams(useLocation().search);
  const ret = {
    country: [], topic: [], src: ''
  }
  for (var key of srcParams.keys()) {
    ret[key] = srcParams.get(key).split(',').filter(it => it !== '')
  }
  return ret
}

const Browse = ({ history }) => {
  const query = useQuery()
  const [countryOpts, setCountryOpts] = useState([])
  const [results, setResults] = useState([])
  useEffect(() => {
    axios({
      method: 'get',
      url: '/api/browse'
    })
    .then((resp) => {
      setResults(resp?.data?.results)
    })
    axios({
      methid: 'get',
      url: '/api/country'
    })
    .then((resp) => {
      setCountryOpts(resp.data.map(it => ({ value: it.iso_code, label: it.name })))
    })
  }, [])
  const updateQuery = (param, value) => {
    const newQuery = {...query}
    newQuery[param] = value
    const newParams = new URLSearchParams(newQuery)
    history.push(`/browse?${newParams.toString()}`)
  }
  return (
    <div id="browse">
      <div className="ui container">
        <aside>
          <div className="inner">
            <Input value={query.src} className="src" placeholder="Search for topics" suffix={<SearchOutlined />} onChange={({ target: { value }}) => updateQuery('src', value)} />
            <Select value={query.country} placeholder="Countries" mode="multiple" options={countryOpts} allowClear onChange={val => updateQuery('country', val)} />
            <Select value={query.topic} placeholder="Topics" mode="multiple" options={topicTypes.map(type => ({ value: type, label: type }))} onChange={val => updateQuery('topic', val)} />
          </div>
        </aside>
        <div className="main-content">
          {results.map(result => <Result {...{result}} />)}
        </div>
      </div>
    </div>
  )
}

const Result = ({ result }) => {
  return (
    <Card className="result">
      <h3>{result.title}</h3>
      <div className="type">{result.type}</div>
      <ul className="stats">
        <li>
          {result.geo_coverage_countries.join(', ')}
        </li>
      </ul>
      {result.description && <p>{result.description}</p>}
    </Card>
  )
}

export default withRouter(Browse)
