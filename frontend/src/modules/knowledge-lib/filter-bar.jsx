import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import { useQuery } from '../../utils/misc'
import { Icon } from '../../components/svg-icon/svg-icon'
import FilterIcon from '../../images/knowledge-library/filter-icon.svg'
import CountryTransnationalFilter from '../../components/select/country-transnational-filter'
import LocationDropdown from '../../components/location-dropdown/location-dropdown'
import api from '../../utils/api'
import { LeftOutlined, CloseOutlined } from '@ant-design/icons'

export const resourceTypes = [
  {
    key: 'technical-resource',
    label: 'Technical Resources',
    title: 'technical_resource',
  },
  { key: 'event', label: 'Events', title: 'event' },
  { key: 'technology', label: 'Technologies', title: 'technology' },
  {
    key: 'capacity-building',
    label: 'Capacity Development',
    title: 'capacity building',
  },
  { key: 'initiative', label: 'Initiatives', title: 'initiative' },
  { key: 'action-plan', label: 'Action Plans', title: 'action_plan' },
  { key: 'policy', label: 'Policies', title: 'policy' },
  {
    key: 'financing-resource',
    label: 'Financing Resources',
    title: 'financing_resource',
  },
]

const hideFilterList = [
  'offset',
  'country',
  'transnational',
  'topic',
  'view',
  'orderBy',
  'descending',
]

const FilterBar = ({
  totalCount,
  setShowFilterModal,
  filterCountries,
  updateQuery,
  multiCountryCountries,
  setMultiCountryCountries,
  history,
  type,
  view,
  search,
  pathname,
}) => {
  const query = useQuery()
  const [country, setCountry] = useState([])
  const [multiCountry, setMultiCountry] = useState([])
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [disable, setDisable] = useState({
    country: false,
    multiCountry: false,
  })

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

  const isEmpty = Object.values(query).every(
    (x) => x === null || x === undefined || x?.length === 0
  )

  const handleClickOverview = () => {
    history.push({
      pathname: '/knowledge/library/overview',
      search: '',
    })
  }

  useEffect(() => {
    if (
      filterCountries &&
      filterCountries.length > 0 &&
      multiCountry.length === 0
    ) {
      setCountry(filterCountries.map((item) => parseInt(item)))
    } else {
      setCountry([])
    }
  }, [filterCountries, multiCountry])

  const countryList = (
    <CountryTransnationalFilter
      {...{
        query,
        updateQuery,
        multiCountryCountries,
        setMultiCountryCountries,
        history,
      }}
      country={query?.country?.map((x) => parseInt(x)) || []}
      multiCountry={query?.transnational?.map((x) => parseInt(x)) || []}
      multiCountryLabelCustomIcon={true}
      countrySelectMode="multiple"
      multiCountrySelectMode="multiple"
      fetch={true}
      disable={disable}
      setDisable={setDisable}
    />
  )

  const resetFilter = () => {
    const newQuery = {}

    const newParams = new URLSearchParams(newQuery)
    history.push({
      pathname: pathname,
      search: newParams.toString(),
    })
  }

  return (
    <div className="filter-bar">
      <div className="overview">
        <ul className="categories">
          <li
            className={`${!type ? 'selected' : ''}`}
            onClick={() => {
              history.push(
                {
                  pathname: `/knowledge/library`,
                  query: {
                    totalCount: JSON.stringify(totalCount),
                  },
                },
                '/knowledge/library'
              )
            }}
          >
            <div>
              <DynamicSVG
                type="all"
                fillColor={`${!view ? '#06496c' : '#fff'}`}
              />
              <b>{allResources}</b>
            </div>
            <span>All Resources</span>
          </li>
          {resourceTypes.map((t) => (
            <li
              className={`${type === t.key ? 'selected' : ''}`}
              key={t.key}
              onClick={() => {
                history.push(
                  {
                    pathname: `/knowledge/library/${
                      view ? (view === 'category' ? 'grid' : view) : 'map'
                    }/${t.key}`,
                    query: {
                      ...history.query,
                      totalCount: JSON.stringify(totalCount),
                    },
                  },
                  `/knowledge/library/${
                    view ? (view === 'category' ? 'grid' : view) : 'map'
                  }/${t.key}`
                )
              }}
            >
              <div>
                <DynamicSVG
                  type={`${t.key}`}
                  fillColor={`${!view ? '#06496c' : '#fff'}`}
                />
                <b>
                  {totalCount.find((item) => t.title === item.topic)?.count ||
                    'XX'}
                </b>
              </div>
              <span>{t.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="search-container">
        <Button className="adv-src" onClick={() => setShowFilterModal(true)}>
          {!isEmpty &&
            Object.keys(query).filter(
              (item) =>
                !hideFilterList.includes(item) &&
                item !== 'slug' &&
                item !== 'totalCount'
            ).length > 0 && (
              <div className="filter-status">
                {Object.keys(query).filter(
                  (item) => !hideFilterList.includes(item)
                ).length > 0 &&
                  Object.keys(query).filter(
                    (item) => !hideFilterList.includes(item)
                  ).length}
              </div>
            )}
          <FilterIcon />
          <span>Advanced Search</span>
        </Button>
        {!isEmpty &&
          Object.keys(query).filter(
            (item) =>
              !hideFilterList.includes(item) &&
              item !== 'slug' &&
              item !== 'totalCount'
          ).length > 0 && (
            <Button
              icon={<CloseOutlined />}
              className="reset-button"
              onClick={() => resetFilter()}
            >
              Reset filters
            </Button>
          )}
        <LocationDropdown
          {...{
            country,
            multiCountry,
            countryList,
            dropdownVisible,
            setDropdownVisible,
            query,
          }}
        />
      </div>
    </div>
  )
}

function DynamicSVG({ type, fillColor }) {
  const [svgContent, setSvgContent] = useState(null)

  useEffect(() => {
    fetch(`/resource-types/${type}.svg`)
      .then((response) => response.text())
      .then((content) => setSvgContent(content))
  }, [type])

  if (!svgContent) return null

  const updatedContent = svgContent.replace(
    'fill="#06496c"',
    `fill="${fillColor}"`
  )

  return <div dangerouslySetInnerHTML={{ __html: updatedContent }} />
}

export default FilterBar
