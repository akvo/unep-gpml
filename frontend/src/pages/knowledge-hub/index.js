import classNames from 'classnames'
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './index.module.scss'
import { Check, Check2, SearchIcon } from '../../components/icons'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import ResourceCard from '../../components/resource-card/resource-card'
import DetailModal from '../../modules/details-page/modal'
import { useRouter } from 'next/router'
import bodyScrollLock from '../../modules/details-page/scroll-utils'
import { Dropdown, Input, Menu, Select, Space, Spin } from 'antd'
import { debounce } from 'lodash'
import Button from '../../components/button'
import { Trans, t } from '@lingui/macro'
import { UIStore } from '../../store'
import { multicountryGroups } from '../../modules/knowledge-library/multicountry'
import { DownOutlined, LoadingOutlined } from '@ant-design/icons'
import { loadCatalog } from '../../translations/utils'

const getCountryIdsFromGeoGroups = (
  selectedGeoCountryGroup,
  geoCountryGroups
) => {
  let countryIds = []
  selectedGeoCountryGroup.forEach((groupName) => {
    const group = geoCountryGroups.find((g) => g.name === groupName)
    if (group) {
      countryIds = [
        ...countryIds,
        ...group.countries.map((country) => country.id),
      ]
    }
  })
  return countryIds
}

const KnowledgeHub = ({ serverData, setLoginVisible, isAuthenticated }) => {
  const router = useRouter()
  const [results, setResults] = useState(serverData.results)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const selectedThemes = router.query.tag ? router.query.tag.split(',') : []
  const selectedTypes = router.query.topic ? router.query.topic.split(',') : []
  const selectedCountries = router.query.country
    ? router.query.country.split(',')
    : []
  const selectedGeoCountryGroup = router.query.geo
    ? router.query.geo.split(',')
    : []
  const [searchInput, setSearchInput] = useState(router.query.q || '')
  const [params, setParams] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [offset, setOffset] = useState(0)
  const [limit] = useState(20)
  const [hasMore, setHasMore] = useState(serverData.hasMore)
  const { countries, featuredOptions } = UIStore.useState((s) => ({
    countries: s.countries,
    featuredOptions: s.featuredOptions,
  }))

  const countryOpts = countries
    ? countries
        .filter(
          (country) => country.description.toLowerCase() === 'member state'
        )
        .map((it) => ({ value: it.id, label: it.name }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : []

  useEffect(() => {
    setResults(serverData.results)
    setHasMore(serverData.hasMore)
    setOffset(0)
  }, [serverData])

  const updateQueryParams = useCallback(
    (updates) => {
      const currentQuery = router.query
      const selectedCountryGroupCountries = getCountryIdsFromGeoGroups(
        updates.geo ? updates.geo.split(',') : [],
        featuredOptions
      )

      const newQuery = {
        ...(currentQuery.q && { q: currentQuery.q }),
        ...(currentQuery.tag && { tag: currentQuery.tag }),
        ...(currentQuery.topic && { topic: currentQuery.topic }),
        ...(currentQuery.country && { country: currentQuery.country }),
        ...(currentQuery.geo && { geo: currentQuery.geo }),
        ...(currentQuery.sort && { sort: currentQuery.sort }),
        ...updates,
      }

      if (newQuery.geo) {
        newQuery.country = selectedCountryGroupCountries.join(',')
      } else if (newQuery.country) {
        delete newQuery.geo
      }
      // Remove empty query params
      Object.keys(newQuery).forEach(
        (key) =>
          (newQuery[key] === undefined || newQuery[key] === '') &&
          delete newQuery[key]
      )

      router.push({ pathname: router.pathname, query: newQuery }, undefined, {
        shallow: false,
      })
    },
    [router]
  )

  useEffect(() => {
    if (!modalVisible) {
      const previousHref = router.asPath
      window.history.pushState(
        { urlPath: `/${previousHref}` },
        '',
        `${previousHref}`
      )
    }
  }, [modalVisible])

  const themes = [
    'Plastic Production & Distribution',
    'Plastic Consumption',
    'Reuse',
    'Recycle',
    'Waste Management',
    'Just Transition of Informal Sector',
  ].map((it) => ({ name: it }))

  const types = [
    { name: 'Technical Resource', value: 'technical_resource' },
    { name: 'Technology', value: 'technology' },
    { name: 'Action Plan', value: 'action_plan' },
    { name: 'Policy & Legislation', value: 'policy' },
    { name: 'Financing Resource', value: 'financing_resource' },
    { name: 'Case Studies', value: 'case_study' },
  ]

  const handleThemeToggle = (theme) => {
    const newThemes = selectedThemes.includes(theme)
      ? selectedThemes.filter((t) => t !== theme)
      : [...selectedThemes, theme]
    updateQueryParams({
      tag: newThemes.length > 0 ? newThemes.join(',') : undefined,
    })
  }

  const handleTypeToggle = (type) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type]
    updateQueryParams({
      topic: newTypes.length > 0 ? newTypes.join(',') : undefined,
    })
  }

  const handleGeoToggle = (group) => {
    const newGeoGroups = selectedGeoCountryGroup.includes(group)
      ? selectedGeoCountryGroup.filter((g) => g !== group)
      : [...selectedGeoCountryGroup, group]
    updateQueryParams({
      geo: newGeoGroups.length > 0 ? newGeoGroups.join(',') : undefined,
      country: undefined,
    })
  }

  const handleCountryChange = (value) => {
    updateQueryParams({ ...router.query, countries: value })
  }

  const showModal = ({ e, item }) => {
    const { type, id } = item
    e?.preventDefault()
    if (type && id) {
      const detailUrl = `/${type.replace(/_/g, '-')}/${id}`
      setParams({ type: type.replace(/_/g, '-'), id, item })
      window.history.pushState({}, '', detailUrl)
      setModalVisible(true)
      bodyScrollLock.enable()
    }
  }

  const fetchData = async (newOffset = 0) => {
    const params = new URLSearchParams()

    if (search) params.append('q', search)
    if (selectedThemes.length > 0)
      params.append('tag', selectedThemes.join(','))
    if (selectedTypes.length > 0)
      params.append('topic', selectedTypes.join(','))
    const selectedCountryGroupCountries = getCountryIdsFromGeoGroups(
      selectedGeoCountryGroup,
      featuredOptions
    )
    if (
      selectedCountries.length > 0 ||
      selectedCountryGroupCountries.length > 0
    )
      params.append(
        'country',
        selectedCountryGroupCountries.length > 0
          ? selectedCountryGroupCountries.join(',')
          : selectedCountries.join(',')
      )

    params.append('incBadges', 'true')
    params.append('limit', limit)
    params.append('offset', newOffset)

    setLoading(true)

    const response = await api.get(`/resources?${params.toString()}`)
    const newResults = response.data.results

    if (newOffset === 0) {
      setResults(newResults)
    } else {
      setResults((prevResults) => [...prevResults, ...newResults])
    }

    setHasMore(newResults.length === limit)
    setLoading(false)
  }

  const loadMore = () => {
    const newOffset = offset + limit
    fetchData(newOffset)
    setOffset(newOffset)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    if (value) {
      debouncedUpdateSearch(value)
    } else {
      debouncedUpdateSearch.cancel()
      updateQueryParams({ ...router.query, q: '' })
    }
  }

  const debouncedUpdateSearch = useCallback(
    debounce((value) => {
      updateQueryParams({ ...router.query, q: value })
    }, 300),
    [updateQueryParams]
  )

  const [sorting, setSorting] = useState('newest')
  const handleSortingChange = (e, v) => {
    setSorting(e.key)
  }
  const sortingOpts = [
    { key: 'newest', label: 'Most Recent First' },
    { key: 'oldest', label: 'Oldest First' },
  ]

  return (
    <div className={styles.knowledgeHub}>
      <aside className="filter-sidebar">
        <div className="sticky">
          <Input
            className="src"
            allowClear
            placeholder="Search Resources"
            value={searchInput}
            onChange={handleSearchChange}
          />
          <div className="caps-heading-xs">browse resources by</div>
          <div className="section">
            <h4 className="h-xs w-semi">Theme</h4>
            <div className="filters">
              {themes?.map((theme) => (
                <FilterToggle
                  key={theme.name}
                  onToggle={() => handleThemeToggle(theme.name)}
                  isSelected={selectedThemes.includes(theme.name)}
                >
                  {theme.name}
                </FilterToggle>
              ))}
            </div>
          </div>
          <div className="section">
            <h4 className="h-xs w-semi">Resource Type</h4>
            <div className="filters">
              {types.map((type) => (
                <FilterToggle
                  key={type.name}
                  onToggle={() => handleTypeToggle(type.value)}
                  isSelected={selectedTypes.includes(type.value)}
                >
                  {type.name}
                </FilterToggle>
              ))}
            </div>
          </div>
          <div className="section">
            <h4 className="h-xs w-semi">Geography</h4>
            <div className="filters">
              {featuredOptions.map((type) => (
                <FilterToggle
                  key={type.name}
                  onToggle={() => handleGeoToggle(type.name)}
                  isSelected={selectedGeoCountryGroup.includes(type.name)}
                >
                  {type.name}
                </FilterToggle>
              ))}
            </div>
          </div>
          <div className="section">
            <h4 className="h-xs w-semi">Country</h4>

            <Select
              size="small"
              showSearch
              allowClear
              mode="multiple"
              dropdownClassName="multiselection-dropdown"
              dropdownMatchSelectWidth={false}
              placeholder={t`Countries`}
              options={countryOpts}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              showArrow
              suffixIcon={<SearchIcon />}
              virtual={false}
              onChange={handleCountryChange}
            />
          </div>
        </div>
      </aside>
      <div className="content">
        <div className="sorting">
          <Dropdown
            overlay={
              <Menu
                defaultSelectedKeys={['newest']}
                selectable
                onSelect={handleSortingChange}
                selectedKeys={sorting}
              >
                {sortingOpts.map((it) => (
                  <Menu.Item key={it.key}>{it.label}</Menu.Item>
                ))}
              </Menu>
            }
            trigger={['click']}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                {sortingOpts.find((it) => it.key === sorting)?.label}
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </div>
        {loading && (
          <div className="loading">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
          </div>
        )}
        <div className="results">
          {results?.map((result) => (
            <ResourceCard
              item={result}
              // onBookmark={() => {}}
              onClick={showModal}
            />
          ))}
          {results?.length === 0 && !loading && (
            <>
              <div className="no-results">
                <h4 className="caps-heading-s">No results</h4>
              </div>
            </>
          )}
        </div>
        {hasMore && results.length > 0 && (
          <Button size="large" ghost onClick={loadMore} className="load-more">
            <Trans>Load More</Trans>
          </Button>
        )}
      </div>
      <DetailModal
        match={{ params }}
        visible={modalVisible}
        setVisible={setModalVisible}
        isServer={false}
        {...{
          setLoginVisible,
          isAuthenticated,
        }}
      />
    </div>
  )
}

// const ResourceCard = () => {}

const FilterToggle = ({ children, onToggle, isSelected }) => {
  const handleClick = () => {
    onToggle()
  }
  return (
    <div
      className={classNames('filter', { on: isSelected })}
      onClick={handleClick}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ width: 0, height: 0, marginRight: 0 }}
            animate={{ width: 9, height: 8, marginRight: 5 }}
            exit={{ width: 0, height: 0, marginRight: 0 }}
          >
            <Check2 />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  )
}

export async function getServerSideProps(context) {
  const { query, req } = context

  const forwardedProtos = (req.headers['x-forwarded-proto'] || '').split(',')

  const protocol = forwardedProtos[0] || 'http'

  const baseUrl = `${protocol}://${req.headers.host}/`

  const API_ENDPOINT = process.env.REACT_APP_FEENV
    ? 'https://unep-gpml.akvotest.org/api/'
    : `${baseUrl}/api/`

  const limit = 20

  const params = new URLSearchParams({
    ...(query.q && { q: query.q }),
    ...(query.tag && { tag: query.tag }),
    ...(query.topic && { topic: query.topic }),
    ...(query.country && { country: query.country }),
    incBadges: 'true',
    limit: limit.toString(),
    offset: '0',
  })

  try {
    const response = await api.get(
      `${API_ENDPOINT}/resources?${params.toString()}`
    )
    const serverData = {
      results: response.data.results,
      hasMore: response.data.results.length === limit,
    }

    return {
      props: {
        serverData,
        i18n: await loadCatalog(context.locale),
      },
    }
  } catch (error) {
    console.error('Error fetching initial data:', error)
    return {
      props: {
        serverData: { results: [], hasMore: false },
        i18n: await loadCatalog(context.locale),
      },
    }
  }
}

export default KnowledgeHub
