import React, { useEffect, useState } from 'react'
import humps from 'humps'
import api from "../../utils/api";
import { resourceTypes } from "./filter-bar";


const Overview = ({ summaryData, setView }) => {
  const summaryDict = {}
  let allResources = 0
  summaryData.forEach(obj => {
    const key = Object.keys(obj)[0]
    summaryDict[key] = obj[key]
    allResources += obj[key]
  })
  return (
    <div className="overview">
      <h3>Categories</h3>
      <ul className="categories">
        <li onClick={() => { setView('grid') }}>
          <b>{allResources}</b>
          <span>All Resources</span>
        </li>
        {resourceTypes.map(type => (
          <li onClick={() => { setView('map'); /* TODO apply filter */ }}>
            <b>{summaryDict[humps.camelize(type.key)] || 'XX'}</b>
            <span>{type.label}</span>
          </li>
        ))}
      </ul>
      <Featured />
    </div>
  )
}

const Featured = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/browse?featured=true').then((d) => {

    })
  }, [])
  return (
    <h3>Featured resources</h3>
  )
}

export default Overview