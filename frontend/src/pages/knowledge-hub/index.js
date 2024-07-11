import classNames from 'classnames'
import { useEffect, useState } from 'react'
import styles from './index.module.scss'
import { Check, Check2, SearchIcon } from '../../components/icons'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import ResourceCard from '../../components/resource-card/resource-card'
import DetailModal from '../../modules/details-page/modal'
import { useRouter } from 'next/router'
import bodyScrollLock from '../../modules/details-page/scroll-utils'
import { Input, Select } from 'antd'
import { debounce } from 'lodash'
import Button from '../../components/button'
import { Trans, t } from '@lingui/macro'
import { UIStore } from '../../store'

const KnowledgeHub = ({ setLoginVisible, isAuthenticated }) => {
  const [results, setResults] = useState([])
  const [search, setSearch] = useState('')
  const [selectedThemes, setSelectedThemes] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedCountries, setSelectedCountries] = useState([])
  const router = useRouter()
  const [params, setParams] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [offset, setOffset] = useState(0)
  const [limit] = useState(20)
  const [hasMore, setHasMore] = useState(true)
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
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
    fetchData()
  }, [search, selectedThemes, selectedTypes, selectedCountries])

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
    { name: 'Plastic Production & Distribution' },
    { name: 'Plastic Consumption' },
    { name: 'Reuse' },
    { name: 'Recycle' },
    { name: 'Waste Management' },
    { name: 'Just Transition of Informal Sector' },
  ]

  const types = [
    { name: 'Technical Resource', value: 'technical_resource' },
    { name: 'Technology', value: 'technology' },
    { name: 'Action Plan', value: 'action_plan' },
    { name: 'Policy & Legislation', value: 'policy' },
    { name: 'Financing Resource', value: 'financing_resource' },
    { name: 'Case Studies', value: 'case_study' },
  ]

  const handleThemeToggle = (theme) => {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    )
  }

  const handleTypeToggle = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleCountryChange = (value) => {
    if (value) {
      setSelectedCountries(value)
    } else {
      setSelectedCountries([])
    }
  }

  const showModal = ({ e, item }) => {
    const { type, id } = item
    e?.preventDefault()
    if (type && id) {
      const detailUrl = `/${type.replace(/_/g, '-')}/${id}`
      setParams({ type, id, item })
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
    if (selectedCountries.length > 0)
      params.append('country', selectedCountries.join(','))

    params.append('incBadges', 'true')
    params.append('limit', limit)
    params.append('offset', newOffset)

    const response = await api.get(`/resources?${params.toString()}`)
    const newResults = response.data.results

    if (newOffset === 0) {
      setResults(newResults)
    } else {
      setResults((prevResults) => [...prevResults, ...newResults])
    }

    setHasMore(newResults.length === limit)
  }

  const clearSearch = () => {
    setSearch('')
  }

  const loadMore = () => {
    const newOffset = offset + limit
    fetchData(newOffset)
    setOffset(newOffset)
  }

  const debouncedSearch = debounce((value) => {
    setSearch(value)
  }, 300)

  return (
    <div className={styles.knowledgeHub}>
      <aside className="filter-sidebar">
        <div className="sticky">
          <Input
            className="src"
            allowClear
            placeholder="Search Resources"
            onChange={(e) => {
              if (e.target.value) {
                debouncedSearch(e.target.value)
              } else {
                clearSearch()
              }
            }}
          />
          <div className="caps-heading-xs">browse resources by</div>
          <div className="section">
            <h4 className="h-xs w-semi">Theme</h4>
            <div className="filters">
              {themes.map((theme) => (
                <FilterToggle
                  key={theme.name}
                  onToggle={() => handleThemeToggle(theme.name)}
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
      <div>
        <div className="results">
          {results?.map((result) => (
            <ResourceCard
              item={result}
              // onBookmark={() => {}}
              onClick={showModal}
            />
          ))}
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

const FilterToggle = ({ children, onToggle }) => {
  const [on, setOn] = useState(false)
  const handleClick = () => {
    setOn(!on)
    onToggle()
  }
  return (
    <div className={classNames('filter', { on })} onClick={handleClick}>
      <AnimatePresence>
        {on && (
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

export default KnowledgeHub
