import React, { useEffect, useState } from 'react'
import { Button, Select } from 'antd';
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import Maps from './maps'
import './styles.scss'

const topicTypes = ['project', 'event', 'policy', 'technology', 'resource']

const Landing = ({ history }) => {
    const [country, setCountry] = useState(null);
    const [data, setData] = useState(null)

    const clickEvents = ({name, data}) => {
      setCountry(name);
      history.push(`/browse/${name}`)
    }

    const toolTip = (params) => {
        const summary = data.map.find(it => it.iso_code === params.name)
        if(summary){
          return `
            <div class="map-tooltip">
              <h3>${summary.name}</h3>
              <ul>
              ${topicTypes.map(topic => `<li><span>${topic}</span><b>${summary[topic]}</b></li>`).join('')}
              </ul>
            </div>
          `
        }
        return null
    }

    useEffect(() => {
      axios({
        method: 'get',
        url: '/api/landing'
      })
      .then((resp) => {
        setData(resp.data)
      })
    }, [])
    
    const handleChangeCountry = (iso_code) => {
      setCountry(iso_code)
    }
    const countryOpts = data ? data.map.map(it => ({ value: it.iso_code, label: it.name })) : []
    const countryObj = data && country && data.map.find(it => it.iso_code === country)

    return (
      <div id="landing">
        {data &&
        <div className="map-overlay">
          <Select
            showSearch
            allowClear
            placeholder="Countries"
            options={countryOpts}
            optionFilterProp="children"
            filterOption={(input, option) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
            value={country}
            onChange={handleChangeCountry}
          />
          <Summary summary={data.summary} country={countryObj} />
        </div>
        }
        <Maps
          data={country ? [{name:country, itemStyle:{areaColor: "#00AAF1"}}] : []}
          clickEvents={clickEvents}
          tooltip={toolTip}
        />
        <div className="topics">
          <div className="ui container">
            {data?.topics.map((topic, index) => <TopicItem key={`topic-${index}`} {...{ topic }} />)}
          </div>
        </div>
      </div>
    )
}

const Summary = ({ summary, country }) => {
  return (
    <div className="summary">
      <header>{!country ? 'Global summary' : 'Summary' }</header>
      <ul>
        {!country && summary.map((it, index) =>
          <li key={`li-${index}`}>
            <b>{it[Object.keys(it)[0]]}</b>
            <div className="label">{Object.keys(it)[0]}</div>
            <span>in {it.countries} countries</span>
          </li>
        )}
        {country && topicTypes.map(type =>
        <li key={type} className="for-country">
          <b>{country[type]}</b>
          <div className="label">{type}</div>
        </li>
        )}
      </ul>
    </div>
  )
}

const TopicItem = ({ topic }) => (
  <div className="topic-item">
    <div className="inner">
      <span className="type">latest {topic.type}</span>
      <h2>{topic.title}</h2>
      <ul>
        <li>27 feb 2021</li>
      </ul>
      {topic.description && <p>{topic.description}</p>}
      <footer>
        <Button type="link">Find out more</Button>
      </footer>
    </div>
  </div>
)

export default withRouter(Landing)
