import React, { useEffect, useState } from 'react'
import api from '../../utils/api'
import FilterBar from './filter-bar'
import './style.scss'

const KnowledgeLib = () => {
  const [view, setView] = useState('map') // to be changed to 'overview' later
  const [isAscending, setIsAscending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCountries, setFilterCountries] = useState([]);
  const [filter, setFilter] = useState([]);
  const [data, setData] = useState({})

  const fetchData = (params) => {
    api
      .get('/browse', { page_size: 30, page_n: 0, ...params })
      .then((resp) => {
        setData(resp.data)
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div id="knowledge-lib">
      <FilterBar {...{ view, setView, filterCountries, setFilterCountries, filter, setFilter }} />
    </div>
  )
}

export default KnowledgeLib