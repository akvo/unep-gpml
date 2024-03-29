import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import { useQuery } from '../../utils/misc'
import { Icon } from '../../components/svg-icon/svg-icon'
import FilterIcon from '../../images/knowledge-library/filter-icon.svg'
import CountryTransnationalFilter from '../../components/select/country-transnational-filter'
import LocationDropdown from '../../components/location-dropdown/location-dropdown'
import { Trans, t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export const useResourceTypes = () => {
  const { i18n } = useLingui()

  const resourceTypes = [
    {
      key: 'technical-resource',
      label: i18n._(t`Technical Resources`),
      title: 'technical_resource',
    },
    { key: 'event', label: i18n._(t`Events`), title: 'event' },
    { key: 'technology', label: i18n._(t`Technologies`), title: 'technology' },
    {
      key: 'capacity-building',
      label: i18n._(t`Capacity Development`),
      title: 'capacity building',
    },
    { key: 'initiative', label: i18n._(t`Initiatives`), title: 'initiative' },
    {
      key: 'action-plan',
      label: i18n._(t`Action Plans`),
      title: 'action_plan',
    },
    { key: 'policy', label: i18n._(t`Policies`), title: 'policy' },
    {
      key: 'financing-resource',
      label: i18n._(t`Financing Resources`),
      title: 'financing_resource',
    },
  ]

  return resourceTypes
}

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

  const resourceTypes = useResourceTypes()

  const allResources = totalCount
    ?.filter((array) =>
      resourceTypes?.some(
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

  const { i18n } = useLingui()

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
            <span>
              <Trans>All Resources</Trans>
            </span>
          </li>
          {resourceTypes.map((t) => {
            return (
              <>
                {totalCount.find((item) => t.title === item.topic)?.count >
                  0 && (
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
                        {totalCount.find((item) => t.title === item.topic)
                          ?.count || 'XX'}
                      </b>
                    </div>
                    <span>{i18n._(t.label)}</span>
                  </li>
                )}
              </>
            )
          })}
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
          <span>
            <Trans>Advanced Search</Trans>
          </span>
        </Button>
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

const DynamicSVG = ({ type, fillColor }) => {
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
