import React, { Fragment, useEffect, useState, useMemo } from 'react'
import api from '../../utils/api'
import { useRouter } from 'next/router'
import Sidebar from '../../components/map-and-layers/sidebar'
import CountryOverview from '../../pages/countryOverview'
import DashboardLanding from '../../pages/countryOverview/IntroPage'

function ResourceView({ history }) {
  const router = useRouter()
  const { isReady, query } = router
  const { country } = query

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [countData, setCountData] = useState([])
  const [totalCount, setTotalCount] = useState(
    history?.query?.totalCount ? JSON.parse(history.query.totalCount) : []
  )
  const [gridItems, setGridItems] = useState([])
  const [pageNumber, setPageNumber] = useState(false)
  const [view, type] = history?.query?.slug || []

  const limit = 30
  const uniqueArrayByKey = (array) => [
    ...new Map(array.map((item) => [item['id'], item])).values(),
  ]

  const fetchData = (searchParams) => {
    setLoading(true)
    const queryParams = new URLSearchParams(searchParams)
    queryParams.delete('slug')

    if (type || history?.location?.state?.type) {
      queryParams.set(
        'topic',
        history?.location?.state?.type
          ? history.location.state.type.replace(/-/g, '_')
          : type.replace(/-/g, '_')
      )
    }

    if (
      type === 'capacity-building' ||
      history?.location?.state?.type === 'capacity-building'
    ) {
      queryParams.set('capacity_building', ['true'])
      queryParams.delete('topic')
    }

    queryParams.set('limit', limit)
    queryParams.delete('totalCount')
    const url = `/browse?${String(queryParams)}`

    api
      .get(url)
      .then((resp) => {
        setLoading(false)
        setData(resp?.data)
        setCountData(resp?.data?.counts)
        setGridItems((prevItems) => {
          return uniqueArrayByKey([...prevItems, ...resp?.data?.results])
        })
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  const fetchCount = (searchParams) => {
    const queryParams = new URLSearchParams(searchParams)
    queryParams.set('limit', limit)
    const url = `/browse?${String(queryParams)}`

    api
      .get(url)
      .then((resp) => {
        setTotalCount(
          history?.query?.totalCount
            ? JSON.parse(history.query.totalCount)
            : resp?.data?.counts
        )
      })
      .catch((err) => {})
  }

  useEffect(() => {
    if (totalCount.length === 0) {
      fetchCount()
    }
  }, [totalCount])

  const updateQuery = (param, value, reset, fetch = true) => {
    if (!reset) {
      setPageNumber(null)
      setGridItems([])
    }
    const newQuery = { ...query }
    newQuery[param] = value

    if (param === 'descending' || query.hasOwnProperty('descending')) {
      newQuery['orderBy'] = 'title'
    }

    const arrayOfQuery = Object.entries(newQuery)?.filter(
      (item) => item[1]?.length !== 0 && typeof item[1] !== 'undefined'
    )
    const pureQuery = Object.fromEntries(arrayOfQuery)
    const newParams = new URLSearchParams(pureQuery)
    newParams.delete('offset')
    if (fetch && view !== 'category') fetchData(pureQuery)
  }

  useMemo(() => {
    if (isReady && !loading) {
      updateQuery('replace')
    }
  }, [isReady, query])

  useEffect(() => {
    if (isReady && data.length === 0) {
      updateQuery()
    }
  }, [isReady])

  return (
    <Fragment>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          maxHeight: '1000px',
          width: '100%',
          overflow: 'auto',
          paddingTop: '50px',
        }}
      >
        <Sidebar alt={false} countryDashboard={true} />

        {country && router.query.categoryId ? (
          <CountryOverview country={country} />
        ) : (
          <DashboardLanding />
        )}
      </div>
    </Fragment>
  )
}

export default ResourceView
