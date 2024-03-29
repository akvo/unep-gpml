import React, { Fragment, useEffect, useState, useMemo } from 'react'
import classNames from 'classnames'
import { CSSTransition } from 'react-transition-group'
import api from '../../utils/api'
import FilterBar from './filter-bar'
import { useResourceTypes } from './filter-bar'
import FilterModal from './filter-modal'
import ResourceCards, {
  ResourceCard,
} from '../../components/resource-cards/resource-cards'
import { LoadingOutlined, DownOutlined } from '@ant-design/icons'
import SortIcon from '../../images/knowledge-library/sort-icon.svg'
import SearchIcon from '../../images/search-icon.svg'
import { Button } from 'antd'
import Maps from '../map/map'
import { isEmpty } from 'lodash'
import { useQuery, topicNames } from '../../utils/misc'
import { Trans, t } from '@lingui/macro'
import { useDeviceSize } from '../landing/landing'
import { useRouter } from 'next/router'

const resourceTopic = [
  'action_plan',
  'initiative',
  'policy',
  'technical_resource',
  'technology',
  'event',
  'financing_resource',
]

function ResourceView({ history, popularTags, landing, box, showModal }) {
  const query = useQuery()
  const { isReady } = useRouter()

  const [isAscending, setIsAscending] = useState(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [countData, setCountData] = useState([])
  const [totalCount, setTotalCount] = useState(
    history.query.totalCount ? JSON.parse(history.query.totalCount) : []
  )
  const [filterCountries, setFilterCountries] = useState([])
  const [multiCountryCountries, setMultiCountryCountries] = useState([])
  const [catData, setCatData] = useState([])
  const [gridItems, setGridItems] = useState([])
  const [pageNumber, setPageNumber] = useState(false)
  const [view, type] = history.query.slug || []
  const { slug, ...queryParams } = history.query
  const { pathname, asPath } = history
  const search = new URLSearchParams(history.query).toString()
  const [showFilterModal, setShowFilterModal] = useState(false)

  const [width] = useDeviceSize()

  const limit = 30
  const totalItems = resourceTopic.reduce(
    (acc, topic) =>
      acc + (countData?.find((it) => it.topic === topic)?.count || 0),
    0
  )

  const resourceTypes = useResourceTypes()

  const allResources = totalCount
    ?.filter((array) =>
      resourceTypes.some(
        (filter) =>
          array.topic === filter.title && filter.title !== 'capacity building'
      )
    )
    ?.reduce(function (acc, obj) {
      return acc + obj.count
    }, 0)

  const uniqueArrayByKey = (array) => [
    ...new Map(array.map((item) => [item['id'], item])).values(),
  ]

  const fetchData = (searchParams) => {
    setLoading(true)
    const queryParams = new URLSearchParams(searchParams)
    queryParams.delete('slug')
    if (type || history?.location?.state?.type)
      queryParams.set(
        'topic',
        history?.location?.state?.type
          ? history?.location?.state?.type.replace(/-/g, '_')
          : type.replace(/-/g, '_')
      )

    if (
      type === 'capacity-building' ||
      history?.location?.state?.type === 'capacity-building'
    ) {
      queryParams.set('capacity_building', ['true'])
      queryParams.delete('topic')
    }
    queryParams.set('incCountsForTags', popularTags)
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
    queryParams.set('incCountsForTags', popularTags)
    queryParams.set('limit', limit)
    const url = `/browse?${String(queryParams)}`

    api
      .get(url)
      .then((resp) => {
        setTotalCount(
          history.query.totalCount
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

    if (newQuery.hasOwnProperty('country')) setFilterCountries(newQuery.country)

    // Remove empty query
    const arrayOfQuery = Object.entries(newQuery)?.filter(
      (item) => item[1]?.length !== 0 && typeof item[1] !== 'undefined'
    )

    const pureQuery = Object.fromEntries(arrayOfQuery)

    const newParams = new URLSearchParams(pureQuery)

    newParams.delete('offset')

    if (fetch && view !== 'category') fetchData(pureQuery)

    if (view === 'category') loadAllCat(pureQuery)

    if (param === 'country') {
      setFilterCountries(value)
    }
  }

  const loadAllCat = async (filter) => {
    setLoading(true)

    const queryParams = new URLSearchParams(filter)
    const promiseArray = resourceTopic.map((url) =>
      api.get(`/browse?topic=${url}&${String(queryParams)}`)
    )

    Promise.all(promiseArray)
      .then((data) => {
        const newData = resourceTopic.map((categories, idx) => ({
          categories,
          data: data[idx].data.results,
          count: data[idx]?.data?.counts[0]?.count || 0,
        }))
        setCatData(newData)
        setLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setLoading(false)
      })
  }

  useMemo(() => {
    if ((pathname || search) && !loading) {
      updateQuery('replace')
    }
  }, [pathname, search])

  useEffect(() => {
    if (isReady && data.length === 0) updateQuery()
  }, [isReady])

  const clickCountry = (name) => {
    const val = query['country']
    let updateVal = []

    if (isEmpty(val)) {
      updateVal = [name]
    } else if (val.includes(name)) {
      updateVal = val.filter((x) => x !== name)
    } else {
      updateVal = [...val, name]
    }

    setFilterCountries(updateVal)
    let updatedQuery = { ...history.query }
    delete updatedQuery.totalCount

    if (updateVal && updateVal.length > 0) {
      updatedQuery.country = updateVal.toString()
    } else {
      delete updatedQuery.country
    }

    history.push({
      pathname: history.pathname,
      query: updatedQuery,
    })
  }

  const handleCategoryFilter = (key) => {
    history.push({
      pathname: `/knowledge/library/${
        view ? (view === 'category' ? 'grid' : view) : 'map'
      }/${key.replace(/_/g, '-')}/`,
      search: search,
      state: { type: key.replace(/-/g, '_') },
    })
  }

  const sortResults = (ascending) => {
    setPageNumber(null)
    if (!ascending) {
      updateQuery('descending', 'false', true)
    } else {
      updateQuery('descending', 'true', true)
    }
    setIsAscending(ascending)
  }

  return (
    <Fragment>
      <FilterBar
        {...{
          history,
          type,
          view,
          totalCount,
          fetchData,
          setFilterCountries,
          setMultiCountryCountries,
          multiCountryCountries,
          updateQuery,
          search,
          setShowFilterModal,
          setPageNumber,
          pathname,
        }}
      />
      <div className="list-content">
        {width >= 768 && (
          <div className="list-toolbar">
            <div className="quick-search">
              <div className="count">
                {view === 'grid'
                  ? t`Showing ${gridItems?.length} of ${totalItems}`
                  : view === 'category'
                  ? `${catData?.reduce(
                      (count, current) => count + current?.count,
                      0
                    )}`
                  : `Showing ${!loading ? data?.results?.length : ''}`}
              </div>
              <div className="search-icon">
                <SearchIcon />
              </div>
            </div>
            <ViewSwitch {...{ type, view, history, queryParams }} />
            <button
              className="sort-by-button"
              onClick={() => {
                if (view === 'grid') setGridItems([])
                sortResults(!isAscending)
              }}
            >
              <div className="sort-icon">
                <SortIcon
                  style={{
                    transform:
                      !isAscending || isAscending === null
                        ? 'initial'
                        : 'rotate(180deg)',
                  }}
                />
              </div>
              <div className="sort-button-text">
                <span>
                  <Trans>Sort by:</Trans>
                </span>
                <b>{!isAscending ? `A>Z` : 'Z>A'}</b>
              </div>
            </button>
          </div>
        )}
        {(view === 'map' || !view) && width >= 768 && (
          <div style={{ position: 'relative' }}>
            {data?.results?.length === 0 ? (
              <div className="no-data">
                No data to show for the selected filters!
              </div>
            ) : (
              <ResourceCards
                items={data?.results}
                showMoreCardAfter={20}
                showMoreCardClick={() => {
                  history.push(
                    {
                      pathname: `/knowledge/library/grid/${type ? type : ''}`,
                      query: queryParams,
                    },
                    `/knowledge/library/grid/${type ? type : ''}`
                  )
                }}
                showModal={(e) =>
                  showModal({
                    e,
                    type: e.currentTarget.type,
                    id: e.currentTarget.id,
                  })
                }
              />
            )}
            {loading && (
              <div className="loading">
                <LoadingOutlined spin />
              </div>
            )}
          </div>
        )}
        {loading && width <= 768 && (
          <div className="loading">
            <LoadingOutlined spin />
          </div>
        )}
        {(view === 'map' || !view) && width >= 768 && (
          <Maps
            query={query}
            box={box}
            countData={countData || []}
            clickEvents={clickCountry}
            isFilteredCountry={filterCountries}
            data={landing?.map || []}
            countryGroupCounts={landing?.countryGroupCounts || []}
            isLoaded={() => true}
            multiCountryCountries={multiCountryCountries}
            useVerticalLegend
            showLegend={true}
            path="knowledge"
            zoom={1.1}
          />
        )}
        {(view === 'grid' || width <= 768) && (
          <GridView
            {...{
              gridItems,
              totalItems,
              limit,
              loading,
              setPageNumber,
              pageNumber,
              updateQuery,
              showModal,
            }}
          />
        )}

        {view === 'category' && (
          <div className="cat-view">
            {loading && (
              <div className="loading">
                <LoadingOutlined spin />
              </div>
            )}
            {catData.map((d) => (
              <Fragment key={d.categories}>
                {d?.count > 0 && (
                  <>
                    <div className="header-wrapper">
                      <div className="title-wrapper">
                        <h4 className="cat-title">
                          {topicNames(d.categories)}
                        </h4>
                        <div className="quick-search">
                          <div className="count">{d?.count}</div>
                          <div className="search-icon">
                            <SearchIcon />
                          </div>
                        </div>
                      </div>
                      <Button
                        type="link"
                        block
                        onClick={() => {
                          handleCategoryFilter(d.categories)
                        }}
                      >
                        <Trans>See all</Trans> {`>`}
                      </Button>
                    </div>
                    <ResourceCards
                      items={d?.data}
                      showMoreCardAfter={20}
                      showMoreCardClick={() => {
                        handleCategoryFilter(d.categories)
                      }}
                      showModal={(e) =>
                        showModal({
                          e,
                          type: e.currentTarget.type,
                          id: e.currentTarget.id,
                        })
                      }
                    />
                  </>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>
      <FilterModal
        {...{
          query,
          setShowFilterModal,
          showFilterModal,
          updateQuery,
          fetchData,
          filterCountries,
          asPath,
          history,
          setGridItems,
          loadAllCat,
          view,
          pathname,
        }}
      />
    </Fragment>
  )
}

const GridView = ({
  gridItems,
  loading,
  updateQuery,
  totalItems,
  limit,
  setPageNumber,
  pageNumber,
  showModal,
}) => {
  return (
    <div className="grid-view">
      <div className="items">
        {gridItems?.map((item, index) => (
          <ResourceCard
            item={item}
            key={item.id * index}
            showModal={(e) =>
              showModal({
                e,
                type: item?.type.replace('_', '-'),
                id: item?.id,
              })
            }
          />
        ))}
      </div>
      {!loading && gridItems?.length < totalItems && (
        <Button
          className="load-more"
          loading={loading}
          onClick={() => {
            setPageNumber((prevNumber) => prevNumber + limit)
            updateQuery('offset', [pageNumber + limit], true)
          }}
        >
          <Trans>Load More</Trans>
        </Button>
      )}
    </div>
  )
}

const ViewSwitch = ({ type, view, history, queryParams }) => {
  const viewOptions = [t`map`, t`grid`, t`category`]
  const [visible, setVisible] = useState(false)
  view = !view ? 'map' : view

  return (
    <div className="view-switch-container">
      <div
        className={classNames('switch-btn', { active: visible })}
        onClick={() => {
          setVisible(!visible)
        }}
      >
        <DownOutlined />
        {view} <Trans>view</Trans>
      </div>
      <CSSTransition
        in={visible}
        timeout={200}
        unmountOnExit
        classNames="view-switch"
      >
        <div className="view-switch-dropdown">
          <ul>
            {viewOptions
              .filter((opt) => view !== opt)
              .map((viewOption) => (
                <li
                  key={viewOption}
                  onClick={() => {
                    setVisible(!visible)
                    history.push(
                      {
                        pathname: `/knowledge/library/${viewOption}/${
                          type && viewOption !== 'category' ? type : ''
                        }`,
                        query: queryParams,
                      },
                      `/knowledge/library/${viewOption}/${
                        type && viewOption !== 'category' ? type : ''
                      }`
                    )
                  }}
                >
                  {viewOption} <Trans>view</Trans>
                </li>
              ))}
          </ul>
        </div>
      </CSSTransition>
    </div>
  )
}

export default ResourceView
