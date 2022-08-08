import React, { useEffect, useState } from 'react'
import humps from 'humps'
import api from "../../utils/api";
import { resourceTypes } from "./filter-bar";
import ResourceCards from '../../components/resource-cards/resource-cards';
import { Icon } from '../../components/svg-icon/svg-icon';
import Maps from '../map/map';


const Overview = ({ summaryData, setView, box, query, countData, landing }) => {
  const summaryDict = {}
  let allResources = 0
  summaryData?.forEach(obj => {
    const key = Object.keys(obj)[0]
    summaryDict[key] = obj[key]
    allResources += obj[key]
  })
  return (
    <div className="overview">
      <section>
      <h3>Categories</h3>
      <ul className="categories">
        <li onClick={() => { setView('category') }}>
          <div>
            <Icon name={`all`} fill="#000" />
            <b>{allResources}</b>
          </div>
          <span>All Resources</span>
        </li>
        {resourceTypes.map(type => (
          <li onClick={() => { setView('map'); /* TODO apply filter */ }}>
            <div>
              <Icon name={`resource-types/${type.key}`} fill="#000" />
              <b>{summaryDict[humps.camelize(type.key)] || 'XX'}</b>
            </div>
            <span>{type.label}</span>
          </li>
        ))}
      </ul>
      <Featured {...{ setView }} />
      </section>
      <div className="grid">
        <div className="col">
          <h3>Resources by location</h3>
          <div className="overlay-btn" onClick={() => { setView('map') }}>
            <Maps
              {... { box, query, countData }}
              data={landing?.map || []}
              isLoaded={() => true}
              useTooltips={false}
            />
          </div>
        </div>
        <div className="col">
          <h3>Resources by topic</h3>
        </div>
      </div>
      
    </div>
  )
}

const Featured = ({ setView }) => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/browse?featured=true').then(({ data }) => {
      setResults(data.results)
      setLoading(false)
    })
  }, [])
  return (
    <>
      <h3>Featured resources</h3>
      <ResourceCards
        items={results}
        showMoreCardAfter={20}
        showMoreCardClick={() => {
          setView("grid");
        }}
      />
    </>
  )
}

export default Overview