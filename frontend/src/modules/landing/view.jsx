import React, { useEffect, useState } from 'react'
import { Button, Select } from 'antd';
import { withRouter } from 'react-router-dom'
import Maps from './maps'
import './styles.scss'
import { topicTypes } from '../../utils/misc';
import api from '../../utils/api';

const Landing = ({ history }) => {
    const [country, setCountry] = useState(null);
    const [countries, setCountries] = useState(null);
    const [data, setData] = useState(null);
    const [counts, setCounts] = useState("");

    const clickEvents = ({name, data}) => {
      if (!name.startsWith("disputed")) {
        setCountry(name);
        history.push(`/browse?country=${name}`)
      }
    }

    const toolTip = (params) => {
        const summary = data?.map.find(it => it.isoCode === params.name)
        if(summary){
          const countryInfo = countries?.find(it => it.isoCode === summary.isoCode)
          const countryName = countryInfo?.name || summary.isoCode
          return `
            <div class="map-tooltip">
              <h3>${countryName}</h3>
              <ul>
              ${topicTypes.map(topic => `<li><span>${topic}</span><b>${summary[topic]}</b></li>`).join('')}
              </ul>
            </div>
          `
        }
        return null
    }

    useEffect(() => {
      api.get('/landing')
      .then((resp) => {
        setData(resp.data)
      })

      api.get('/country')
      .then((resp) => {
        setCountries(resp.data)
      })

    }, [])

    const handleChangeCountry = (isoCode) => {
      setCountry(isoCode)
    }
    const countryOpts = data ? data.map.map(it => ({ value: it.isoCode, label: it.name })) : []
    const countryObj = data && country && data.map.find(it => it.isoCode === country)

    const handleSummaryClick = (dataType) => {
        const selected = data.map.map(x => ({
            ...x,
            name: x.isoCode,
            value: x[dataType],
        }));
        setCountries(selected);
        setCounts(dataType.toUpperCase());
    }

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
          <Summary clickEvents={handleSummaryClick} summary={data.summary} country={countryObj} />
        </div>
        }
        <Maps
          data={country ?  [{ name: country, itemStyle: { areaColor: "#26AE60" }}] : (counts ? countries : [])}
          clickEvents={clickEvents}
          tooltip={toolTip}
          title={counts}
        />
        <div className="topics">
          <div className="ui container">
            {data?.topics.map((topic, index) => <TopicItem key={`topic-${index}`} {...{ topic }} />)}
          </div>
        </div>
      </div>
    )
}

const Summary = ({ clickEvents, summary, country }) => {
  return (
    <div className="summary">
      <header>{!country ? 'Global summary' : 'Summary' }</header>
      <ul>
        {!country && summary.map((it, index) =>
        <li key={`li-${index}`} onClick={e => clickEvents(Object.keys(it)[0])}>
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
      <span className="type">latest {topic.topicType}</span>
      <h2>{topic.title || topic.name}</h2>
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
