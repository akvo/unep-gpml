import React, { useState } from 'react'
import { Button, Select, Switch } from 'antd';
import { withRouter } from 'react-router-dom'
import Maps from './maps'
import './styles.scss'
import { topicTypes, topicNames } from '../../utils/misc';
import moment from 'moment'

const Landing = ({ history, data, countries, initLandingCount, setCountries, setInitLandingCount}) => {
    const [country, setCountry] = useState(null);
    const [countryMap, setCountryMap] = useState(null)
    const [counts, setCounts] = useState("");

    const clickEvents = ({name, data}) => {
      if (!name.startsWith("disputed")) {
        setCountry(name);
        history.push(`/browse?country=${name}`)
      }
    }

    const toolTip = (params) => {
        const summary = data?.specific?.find(it => it.isoCode === params.name)
        if(summary){
          const countryInfo = countries?.find(it => it.isoCode === summary.isoCode)
          const countryName = countryInfo?.name || summary.isoCode
          return `
            <div class="map-tooltip">
              <h3>${countryName}</h3>
              <ul>
              ${topicTypes.map(topic => `<li><span>${topicNames(topic)}</span><b>${summary[topic]}</b></li>`).join('')}
              </ul>
            </div>
          `
        }
        return null
    }

    const handleChangeCountry = (isoCode) => {
      setCountry(isoCode)
    }
    const countryOpts = countries ? countries.map(it => ({ value: it.isoCode, label: it.name })).sort((a, b) => a.label.localeCompare(b.label)) : []
    const countryObj = countries && country && countries.find(it => it.isoCode === country)

    const handleSummaryClick = (dataType) => {
      setInitLandingCount("");
      if(counts === dataType){
        setCountryMap(null)
        setCounts('')
      } else {
        const selected = data.map.map(x => ({
            ...x,
            name: x.isoCode,
            value: x[dataType],
        }));
        setCountryMap(selected);
        setCounts(dataType);
      }
    }

    const selected = data?.specific?.find(x => x.isoCode === country)
    const mapData = country ? [{ name: country, itemStyle: { areaColor: "#1890ff" }}] : (counts ? countryMap : [])
    const defaultMapData = initLandingCount !== "" && data ?
        data.map.map(x => ({...x, name: x.isoCode, value: x[initLandingCount]})) : false;

    return (
      <div id="landing">
        <div className="landing-container">
            <div className="landing-banner">
            <b>Welcome to the Global Partnership on Marine Litter Digital Platform</b>
            <p>The Digital Platform compiles different resources from around the world in one place. Find out more by exploring the map below. Simply click on a country or filter by resource type.</p>
            </div>
        </div>
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
          <Summary clickEvents={handleSummaryClick} summary={data.summary}
            country={countryObj} counts={counts} selected={selected}
            init={initLandingCount}/>
        </div>
        }
        <Maps
          data={defaultMapData || mapData}
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

const Summary = ({ clickEvents, summary, country, counts, selected, init }) => {
  return (
    <div className="summary">
      <header>{!selected ? 'Global summary' : 'Summary' }</header>
      <ul>
          {!country && summary.map((it, index) => {
              const current = Object.keys(it)[0];
              let className = init !== current ? "summary-list" : "summary-list-selected";
              if (init === "") {
                  className = current !== counts ? "summary-list" : "summary-list-selected";
                  className = counts === "" ? "" : className;
              }
              return (
              <li key={`li-${index}`}
                  onClick={e => clickEvents(current)}
                  className={className}>
                <Switch size="small" checked={counts === current || init === current} />
                <div className="text">
                  <div className="label">{topicNames(current)}</div>
                  <span>in {it.countries} countries</span>
                </div>
                <b>{it[current]}</b>
              </li>)
          })}
        {country && topicTypes.map(type =>
        <li key={type}>
          <div className="text">
            <div className="label">{topicNames(type)}</div>
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
      <span className="type">latest {topicNames(topic.topicType)}</span>
      <h2>{topic.title || topic.name}</h2>
      <ul>
        <li>{moment(topic.created).format('LL')}</li>
      </ul>
      {topic.description && <p>{topic.description}</p>}
      <div className="bottom">
        <Button type="link">Find out more</Button>
      </div>
    </div>
  </div>
)

export default withRouter(Landing)
