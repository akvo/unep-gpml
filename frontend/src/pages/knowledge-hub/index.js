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
import { multicountryGroups } from '../../modules/knowledge-library/multicountry'


const geoMap = ['Africa', 'Asia', 'Europ','Latin American and Caribbean','Least Developed Countries','LLDCs', 'SIDs']

const getCountryIdsFromGeoGroups = (selectedGeoCountryGroup,geoCountryGroups) => {
  let countryIds = [];
  selectedGeoCountryGroup.forEach(groupName => {
      const group = geoCountryGroups.find(g => g.name === groupName);
      if (group) {
          countryIds = [...countryIds, ...group.countries.map(country => country.id)];
      }
  });
  return countryIds;
}

const KnowledgeHub = ({ setLoginVisible, isAuthenticated }) => {
  const [results, setResults] = useState([])
  const [search, setSearch] = useState('')
  const [selectedThemes, setSelectedThemes] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedCountries, setSelectedCountries] = useState([])
  const [selectedGeoCountryGroup, setSelectedGeoCountryGroup] = useState([])
  const router = useRouter()
  const [params, setParams] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [offset, setOffset] = useState(0)
  const [limit] = useState(20)
  const [hasMore, setHasMore] = useState(true)
  const { countries, tags, transnationalOptions } = UIStore.useState((s) => ({
    countries: s.countries,
    tags: s.tags,
    transnationalOptions: s.transnationalOptions,
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
  }, [search, selectedThemes, selectedTypes, selectedCountries, selectedGeoCountryGroup])

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


  const themes = tags?.['theme']?.map((item) => {
    return {
      name: item.tag,
    }
  })

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

  const handleGeoToggle = (type) => {
    setSelectedGeoCountryGroup((prev) =>
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
    const selectedCountryGroupCountries = getCountryIdsFromGeoGroups(selectedGeoCountryGroup,transnationalOptions);
    if (selectedCountries.length > 0 || selectedCountryGroupCountries.length > 0)
      params.append('country', selectedCountryGroupCountries.length > 0? selectedCountryGroupCountries.join(',') : selectedCountries.join(','))

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
  }, 300);

  const filterByGeoMap = transnationalOptions.filter(country => geoMap.includes(country.name))

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
              {themes?.map((theme) => (
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
            <h4 className="h-xs w-semi">Geography</h4>
            <div className="filters">
              {filterByGeoMap.map((type) => (
                <FilterToggle
                  key={type.name}
                  onToggle={() => handleGeoToggle(type.name)}
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
