import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './index.module.scss'
import { Check, Check2, SearchIcon } from '../../components/icons'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import ResourceCard from '../../components/resource-card/resource-card'
import DetailModal from '../../modules/details-page/modal'
import { useRouter } from 'next/router'
import bodyScrollLock from '../../modules/details-page/scroll-utils'
import { Collapse, Dropdown, Input, Menu, Select, Space, Spin } from 'antd'
import { debounce } from 'lodash'
import Button from '../../components/button'
import { Trans, t } from '@lingui/macro'
import { UIStore } from '../../store'
import { multicountryGroups } from '../../modules/knowledge-library/multicountry'
import { DownOutlined, LoadingOutlined } from '@ant-design/icons'
import { loadCatalog } from '../../translations/utils'
import Link from 'next/link'
import { useLifecycleStageTags } from '../../utils/misc'
import Head from 'next/head'
import translationService from '../../utils/translationService'
// import { lifecycleStageTags } from '../../utils/misc'

export const getCountryIdsFromGeoGroups = (
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

const KnowledgeHub = ({
  newResults,
  hasMore,
  offset,
  isLoadMore,
  setLoginVisible,
  isAuthenticated,
}) => {
  const router = useRouter()
  const [results, setResults] = useState(newResults)
  const [isTranslating, setIsTranslating] = useState(false)
  const originalResults = useRef(newResults)
  const [collapseKeys, setCollapseKeys] = useState(['p1', 'p2', 'p3', 'p4'])
  const [loading, setLoading] = useState(false)
  const selectedTypes = router.query.topic ? router.query.topic.split(',') : []
  const lifecycleStageTags = useLifecycleStageTags()

  const tagsAndThemes = router.query.tag ? router.query.tag.split(',') : []
  const selectedThemes = tagsAndThemes.filter((tag) =>
    lifecycleStageTags.some(
      (stageTag) => stageTag.toLowerCase() === tag.toLowerCase()
    )
  )

  const selectedTags = tagsAndThemes.filter(
    (tag) =>
      !lifecycleStageTags.some(
        (stageTag) => stageTag.toLowerCase() === tag.toLowerCase()
      )
  )

  const selectedGeoCountryGroup = router.query.geo
    ? router.query.geo.split(',')
    : []
  const [searchInput, setSearchInput] = useState(router.query.q || '')
  const [params, setParams] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const { countries, featuredOptions, tags } = UIStore.useState((s) => ({
    countries: s.countries,
    featuredOptions: s.featuredOptions,
    tags: s.tags,
  }))
  const [sorting, setSorting] = useState(
    router.query.orderBy === 'created'
      ? router.query.descending === 'true'
        ? 'newest'
        : 'oldest'
      : 'newest'
  )

  const countryOpts = countries
    ? countries
        .map((it) => ({ value: it.id, label: it.name }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : []

  const tagOpts = useMemo(() => {
    return tags && Object.keys(tags).length > 0
      ? tags.general
          .map((it) => ({ value: it.tag, label: it.tag }))
          .filter((it) => !lifecycleStageTags.includes(it.value))
          .sort((a, b) => a.label.localeCompare(b.label))
      : []
  }, [tags])

  const [displayedOptions, setDisplayedOptions] = useState([])
  const OPTION_PAGE_SIZE = 100

  useEffect(() => {
    if (!isLoadMore) {
      originalResults.current = newResults
    }

    const translateResults = async () => {
      const resultsToTranslate = originalResults.current
      if (router.locale !== 'en' && resultsToTranslate.length > 0) {
        setIsTranslating(true)
        try {
          const translated = await translationService.getTranslatedResources(
            resultsToTranslate,
            router.locale,
            ['title']
          )
          setResults(translated)
        } catch (error) {
          console.error('Translation error:', error)
          setResults(resultsToTranslate)
        } finally {
          setIsTranslating(false)
        }
      } else {
        setResults(resultsToTranslate)
      }
    }

    translateResults()
  }, [newResults, router.locale, isLoadMore])

  useEffect(() => {
    setDisplayedOptions(tagOpts.slice(0, OPTION_PAGE_SIZE))
  }, [tagOpts])

  const onPopupScroll = (e) => {
    const { target } = e
    if (
      target.scrollTop + target.offsetHeight >= target.scrollHeight &&
      displayedOptions.length < tagOpts.length
    ) {
      const nextOptions = tagOpts.slice(
        displayedOptions.length,
        displayedOptions.length + OPTION_PAGE_SIZE
      )
      setDisplayedOptions((prevOptions) => [...prevOptions, ...nextOptions])
    }
  }

  const handleDropdownVisibilityChange = (open) => {
    if (!open) {
      setDisplayedOptions(tagOpts.slice(0, OPTION_PAGE_SIZE))
    }
  }

  const updateQueryParams = useCallback(
    (updates) => {
      const currentQuery = router.query
      const selectedCountryGroupCountries = getCountryIdsFromGeoGroups(
        updates.geo ? updates.geo.split(',') : [],
        updates.featuredOptions ? updates.featuredOptions : featuredOptions
      )
      const newQuery = {
        ...(currentQuery.q && { q: currentQuery.q }),
        ...(currentQuery.tag && { tag: currentQuery.tag }),
        ...(currentQuery.topic && { topic: currentQuery.topic }),
        ...(currentQuery.country && { country: currentQuery.country }),
        ...(currentQuery.geo && { geo: currentQuery.geo }),
        ...(currentQuery.descending && { descending: currentQuery.descending }),
        ...updates,
      }

      if (newQuery.geo) {
        newQuery.country = selectedCountryGroupCountries.join(',')
      } else if (newQuery.country) {
        delete newQuery.geo
      }

      if (newQuery.orderBy) {
        delete newQuery.orderBy
      }
      if (newQuery.featuredOptions) {
        delete newQuery.featuredOptions
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

  const themes = lifecycleStageTags.map((it) => ({ name: it }))

  const types = [
    { name: t`Project`, value: 'project' },
    { name: t`Technical Resource`, value: 'technical_resource' },
    { name: t`Technology`, value: 'technology' },
    { name: t`Action Plan`, value: 'action_plan' },
    { name: t`Legislation`, value: 'policy' },
    { name: t`Financing Resource`, value: 'financing_resource' },
    { name: t`Case Study`, value: 'case_study' },
    { name: t`Initiative`, value: 'initiative' },
    { name: t`Event`, value: 'event' },
    { name: t`Data Portal`, value: 'data_catalog' },
  ]

  const handleThemeToggle = (theme) => {
    const lowerCaseTheme = theme.toLowerCase()
    const newThemes = selectedThemes.includes(lowerCaseTheme)
      ? selectedThemes.filter((t) => t !== lowerCaseTheme)
      : [...selectedThemes, lowerCaseTheme]
    updateQueryParams({
      ...router.query,
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
      featuredOptions: featuredOptions,
    })
  }

  const handleCountryChange = (value) => {
    updateQueryParams({ ...router.query, country: value })
  }

  const handleTagsChange = (value) => {
    const tagQuery = value.join(',')

    updateQueryParams({ ...router.query, tag: tagQuery })
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

  useEffect(() => {
    if (isLoadMore) {
      setResults((prevResults) => [...prevResults, ...newResults])
    } else {
      setResults(newResults)
    }
    setLoading(false)
  }, [newResults, isLoadMore])

  const loadMore = async () => {
    if (!loading && hasMore) {
      setLoading(true)

      try {
        const newOffset = offset + results.length
        const params = new URLSearchParams({
          ...(router.query.q && { q: router.query.q }),
          ...(router.query.tag && { tag: router.query.tag }),
          ...(router.query.topic && { topic: router.query.topic }),
          ...(router.query.country && { country: router.query.country }),
          incBadges: 'true',
          limit: '20',
          offset: newOffset.toString(),
          orderBy: router.query.orderBy || 'created',
          descending: router.query.descending || 'true',
        })

        const response = await api.get(`/resources?${params.toString()}`)
        let moreResults = response.data.results

        originalResults.current = [...originalResults.current, ...moreResults]

        if (router.locale !== 'en' && moreResults.length > 0) {
          moreResults = await translationService.getTranslatedResources(
            moreResults,
            router.locale,
            ['title']
          )
        }

        setResults((prevResults) => [...prevResults, ...moreResults])
      } catch (error) {
        console.error('Error loading more data:', error)
      } finally {
        setLoading(false)
      }
    }
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
  const sortingOpts = [
    {
      key: 'newest',
      label: t`Most Recent First`,
      apiParams: { orderBy: 'created', descending: 'true' },
    },
    {
      key: 'oldest',
      label: t`Oldest First`,
      apiParams: { orderBy: 'created', descending: 'false' },
    },
  ]

  const handleSortingChange = useCallback(
    (key) => {
      const selectedSort = sortingOpts.find((opt) => opt.key === key.key)
      if (selectedSort) {
        setSorting(key.key)
        updateQueryParams(selectedSort.apiParams)
      }
    },
    [updateQueryParams]
  )

  useEffect(() => {
    const onresize = () => {
      if (window.innerWidth <= 768) {
        setCollapseKeys([])
      } else {
        setCollapseKeys(['p1', 'p2', 'p3', 'p4'])
      }
    }
    onresize()
    window.addEventListener('resize', onresize)
    return () => {
      window.removeEventListener('resize', onresize)
    }
  }, [])

  const handleCollapseChange = (v) => {
    setCollapseKeys(v)
  }
  return (
    <div className={styles.knowledgeHub}>
      <Head>
        <title>Knowledge Library | Global Plastics Hub</title>
      </Head>
      <aside className="filter-sidebar">
        <div className="sticky">
          <Input
            className="src"
            allowClear
            placeholder={t`Search The Knowledge Hub`}
            value={searchInput}
            onChange={handleSearchChange}
            aria-label={t`Search The Knowledge Hub`}
          />
          <div className="caps-heading-xs">
            <Trans>browse resources by</Trans>
          </div>
          <Collapse onChange={handleCollapseChange} activeKey={collapseKeys}>
            <Collapse.Panel
              key="p1"
              header={
                <h4 className="h-xs w-semi">
                  <Trans>Life Cycle Stage</Trans>
                </h4>
              }
            >
              <div className="filters">
                {themes?.map((theme) => (
                  <FilterToggle
                    key={theme.name}
                    onToggle={() => handleThemeToggle(theme.name)}
                    isSelected={selectedThemes.some(
                      (selectedTheme) =>
                        selectedTheme.toLowerCase() === theme.name.toLowerCase()
                    )}
                    href={`/knowledge-hub?tag=${encodeURIComponent(
                      theme.name.toLowerCase()
                    )}`}
                  >
                    {theme.name}
                  </FilterToggle>
                ))}
              </div>
            </Collapse.Panel>
            <Collapse.Panel
              key="p2"
              header={
                <h4 className="h-xs w-semi">
                  <Trans>Resource Type</Trans>
                </h4>
              }
            >
              <div className="filters">
                {types.map((type) => (
                  <FilterToggle
                    key={type.name}
                    onToggle={() => handleTypeToggle(type.value)}
                    isSelected={selectedTypes.includes(type.value)}
                    href={`/knowledge-hub?topic=${type.name.toLowerCase()}`}
                  >
                    {type.name}
                  </FilterToggle>
                ))}
              </div>
            </Collapse.Panel>
            <Collapse.Panel
              key="p3"
              header={
                <h4 className="h-xs w-semi">
                  <Trans>Geography</Trans>
                </h4>
              }
            >
              <div className="filters">
                {featuredOptions.map((type) => (
                  <FilterToggle
                    key={type.name}
                    onToggle={() => handleGeoToggle(type.name)}
                    isSelected={selectedGeoCountryGroup.includes(type.name)}
                    href={`/knowledge-hub?geo=${type.name.toLowerCase()}`}
                  >
                    {type.name}
                  </FilterToggle>
                ))}
              </div>
              <Select
                size="small"
                showSearch
                allowClear
                mode="multiple"
                dropdownClassName="multiselection-dropdown"
                dropdownMatchSelectWidth={false}
                placement="topLeft"
                placeholder={t`Countries`}
                options={countryOpts}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                showArrow
                suffixIcon={<SearchIcon />}
                onChange={handleCountryChange}
              />
            </Collapse.Panel>
            <Collapse.Panel
              key="p4"
              header={
                <h4 className="h-xs w-semi">
                  <Trans>Keywords</Trans>
                </h4>
              }
            >
              <Select
                size="small"
                showSearch
                allowClear
                mode="multiple"
                dropdownStyle={{ width: '200px' }}
                dropdownClassName="hub-tags-dropdown"
                dropdownMatchSelectWidth={false}
                placement="topLeft"
                placeholder={t`Keywords`}
                options={displayedOptions}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                showArrow
                virtual={true}
                suffixIcon={<SearchIcon />}
                onPopupScroll={onPopupScroll}
                onChange={handleTagsChange}
                value={selectedTags}
                onDropdownVisibleChange={handleDropdownVisibilityChange}
                className="tag-select"
              />
            </Collapse.Panel>
          </Collapse>
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
        <div className="results" id="main-content">
          {results?.map((result) => (
            <Link
              href={`/${result.type.replace(/_/g, '-')}/${result.id}`}
              onClick={(e) => {
                e.preventDefault()
              }}
            >
              <ResourceCard
                item={result}
                // onBookmark={() => {}}
                onClick={showModal}
              />
            </Link>
          ))}
          {results?.length === 0 && !loading && (
            <>
              <div className="no-results">
                <h4 className="caps-heading-s">
                  <Trans>No results</Trans>
                </h4>
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

export const FilterToggle = ({ children, onToggle, isSelected, href }) => {
  const handleClick = (e) => {
    e.preventDefault()
    onToggle()
  }
  const content = (
    <>
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
    </>
  )
  if (!href)
    return (
      <span
        className={classNames('filter', { on: isSelected })}
        onClick={handleClick}
      >
        {content}
      </span>
    )
  return (
    <Link
      href={href}
      className={classNames('filter', { on: isSelected })}
      onClick={handleClick}
    >
      {content}
    </Link>
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
  const offset = parseInt(query.offset) || 0

  const params = new URLSearchParams({
    ...(query.q && { q: query.q }),
    ...(query.tag && { tag: query.tag }),
    ...(query.topic && { topic: query.topic }),
    ...(query.country && { country: query.country }),
    incBadges: 'true',
    limit: limit.toString(),
    offset: offset.toString(),
    orderBy: query.orderBy || 'created',
    descending: query.descending || 'true',
  })

  try {
    const response = await api.get(
      `${API_ENDPOINT}/resources?${params.toString()}`
    )
    const newResults = response.data.results

    return {
      props: {
        newResults,
        hasMore: newResults.length === limit,
        offset: offset + newResults.length,
        isLoadMore: offset > 0,
        i18n: await loadCatalog(context.locale),
      },
    }
  } catch (error) {
    console.error('Error fetching initial data:', error)
    return {
      props: {
        newResults: [],
        hasMore: false,
        offset: 0,
        isLoadMore: false,
        i18n: await loadCatalog(context.locale),
      },
    }
  }
}

export default KnowledgeHub
