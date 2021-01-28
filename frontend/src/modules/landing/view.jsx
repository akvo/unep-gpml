import React, { useEffect, useState } from 'react'
import { Button, Select, Switch } from 'antd';
import { withRouter } from 'react-router-dom'
import Maps from './maps'
import './styles.scss'
import { topicTypes, topicNames } from '../../utils/misc';
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
              ${topicTypes.map(topic => `<li><span>${topicNames[topic]}</span><b>${summary[topic]}</b></li>`).join('')}
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
    const countryOpts = countries ? countries.map(it => ({ value: it.isoCode, label: it.name })) : []
    const countryObj = countries && country && countries.find(it => it.isoCode === country)

    const handleSummaryClick = (dataType) => {
      if(counts === dataType.toUpperCase()){
        setCountries(null)
        setCounts('')
      } else {
        const selected = data.map.map(x => ({
            ...x,
            name: x.isoCode,
            value: x[dataType],
        }));
        setCountries(selected);
        setCounts(dataType.toUpperCase());
      }
    }

    const selected = data ? data.map.find(x => x.isoCode === country) : false;

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
          <Summary clickEvents={handleSummaryClick} summary={data.summary} country={countryObj} counts={counts} selected={selected}/>
        </div>
        }
        <Maps
          data={country ?  [{ name: country, itemStyle: { areaColor: "#26AE60" }}] : (counts ? countries : [])}
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

const Summary = ({ clickEvents, summary, country, counts, selected }) => {
  return (
    <div className="summary">
      <header>{!selected ? 'Global summary' : 'Summary' }</header>
      <ul>
        {!country && summary.map((it, index) =>
          <li key={`li-${index}`} onClick={e => clickEvents(Object.keys(it)[0])}>
            <Switch size="small" checked={counts === topicNames[Object.keys(it)[0].toUpperCase()]} />
            <div className="text">
              <div className="label">{topicNames[Object.keys(it)[0]]}</div>
              <span>in {it.countries} countries</span>
            </div>
            <b>{it[Object.keys(it)[0]]}</b>
          </li>
        )}
        {country && topicTypes.map(type =>
        <li key={type}>
          <div className="text">
            <div className="label">{topicNames[type]}</div>
          </div>
          <b>{selected?.[type] || 0}</b>
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
