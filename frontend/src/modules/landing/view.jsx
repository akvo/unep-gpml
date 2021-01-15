import { Button, Select } from 'antd';
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Maps from '../../components/Maps'
import './styles.scss'

const Landing = () => {
    const [country, setCountry] = useState("nothing");
    const [data, setData] = useState(null)

    const clickEvents = ({name, data}) => {
        setCountry(name);
    }

    const toolTip = (params) => {
        /* Disputed will started with "disputed-" */
        return params.name;
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

    return (
      <div id="landing">
        <div className="map-overlay">
          <Select
            showSearch
            allowClear
            placeholder="Countries"
            options={data?.map.map(it => ({ value: it.isoCode, label: it.name }))}
            optionFilterProp="children"
            filterOption={(input, option) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
          />
          <div className="summary">
            <header>Global summary</header>
            <ul>
              <li>
                <b>18</b>
                <div className="label">projects</div>
                <span>in 35 countries</span>
              </li>
              <li>
                <b>18</b>
                <div className="label">projects</div>
                <span>in 35 countries</span>
              </li>
              <li>
                <b>18</b>
                <div className="label">projects</div>
                <span>in 35 countries</span>
              </li>
            </ul>
          </div>
        </div>
        <Maps
          data={[]}
          clickEvents={clickEvents}
          tooltip={toolTip}
        />
        <div className="topics">
          <div className="ui container">
            {data?.topics.map(topic => <TopicItem {...{ topic }} />)}
          </div>
        </div>
      </div>
    )
}

const TopicItem = ({ topic }) => [
  <div className="topic-item">
    <div className="inner">
      <span className="type">latest {topic.type}</span>
      <h2>{topic.title}</h2>
      <ul>
        <li>27 feb 2021</li>
      </ul>
      {topic.description && <p>{topic.description}</p>}
      <Button type="link">Find out more</Button>
    </div>
  </div>
]

export default Landing
