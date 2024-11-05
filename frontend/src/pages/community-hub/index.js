import { Button, Collapse, Dropdown, Input, Menu, Select, Spin } from 'antd'
import kbStyles from '../knowledge-hub/index.module.scss'
import { FilterToggle } from '../knowledge-hub'
import { useEffect, useState } from 'react'
import { countries } from 'countries-list'
import { UIStore } from '../../store'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../translations/utils'
import { useRouter } from 'next/router'
import { SearchIcon } from '../../components/icons'
import { LoadingOutlined } from '@ant-design/icons'
import api from '../../utils/api'
import StakeholderCard from '../../components/stakeholder-card/stakeholder-card'
import Link from 'next/link'
import DetailModal from '../../modules/community-hub/modal'

const itemsPerPage = 30

const CommunityHub = ({ setLoginVisible, isAuthenticated, profile }) => {
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [openItem, setOpenItem] = useState(null)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({
    types: ['organisation', 'stakeholder'],
    country: [],
    transnational: [],
    limit: itemsPerPage,
    q: '',
  })
  const [collapseKeys, setCollapseKeys] = useState(['p1', 'p2'])
  const { countries, featuredOptions } = UIStore.useState((s) => ({
    countries: s.countries,
    featuredOptions: s.featuredOptions,
  }))
  const types = [
    { name: 'Organisations', value: 'organisation' },
    { name: 'Individuals', value: 'stakeholder' },
  ]

  const countryOpts = countries
    ? countries
        .filter(
          (country) => country.description.toLowerCase() === 'member state'
        )
        .map((it) => ({ value: it.id, label: it.name }))
    : // .sort((a, b) => a.label.localeCompare(b.label))
      []

  const handleTypeToggle = (type) => {
    setFilters((_filters) => {
      const newTypes = _filters.types.includes(type)
        ? _filters.types.filter((t) => t !== type)
        : [..._filters.types, type]
      return { ...filters, types: newTypes }
    })
  }

  const handleGeoToggle = (transId) => {
    setFilters((_filters) => {
      const newGeoGroups = _filters.transnational.includes(transId)
        ? _filters.transnational.filter((g) => g !== transId)
        : [..._filters.transnational, transId]
      return { ...filters, transnational: newGeoGroups }
    })
  }

  const handleCountryChange = (value) => {
    setFilters((_filters) => {
      return { ...filters, country: value }
    })
  }

  useEffect(() => {
    api.get(`/community?limit=${itemsPerPage}`).then((d) => {
      setResults(d.data.results)
      setLoading(false)
      setHasMore(d.data.results.length === itemsPerPage)
    })
    const onresize = () => {
      if (window.innerWidth <= 768) {
        setCollapseKeys(['p1'])
      } else {
        setCollapseKeys(['p1', 'p2'])
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
  useEffect(() => {
    const $filters = formatFilters(filters)
    $filters.page = 0
    setLoading(true)
    api.get(`/community`, $filters).then((d) => {
      setResults(d.data.results)
      setLoading(false)
      setHasMore(d.data.results.length === itemsPerPage)
    })
  }, [filters])

  let tmid
  const handleSearchChange = (e) => {
    clearTimeout(tmid)
    tmid = setTimeout(() => {
      setFilters((_filters) => {
        return { ...filters, q: e.target.value }
      })
    }, 1000)
  }

  const loadMore = () => {
    setPage((_page) => {
      const $filters = formatFilters(filters)
      $filters.page = _page + 1
      setLoading(true)
      api.get(`/community`, $filters).then((d) => {
        setResults((_results) => {
          return [..._results, ...d.data.results]
        })
        setLoading(false)
        setHasMore(d.data.results.length === itemsPerPage)
      })
      return _page + 1
    })
    // setFilters((_filters) => {
    //   return { ...filters, page: _filters.page + 1 }
    // })
  }
  const handleClick = (result) => (e) => {
    e.preventDefault()
    if (isAuthenticated) {
      setModalVisible(true)
      setOpenItem(result)
    } else {
      setLoginVisible(true)
    }
  }
  return (
    <div className={kbStyles.knowledgeHub}>
      <aside className="filter-sidebar">
        <div className="sticky">
          <Input
            className="src"
            allowClear
            placeholder="Search Community"
            // value={searchInput}
            onChange={handleSearchChange}
          />
          <div className="caps-heading-xs">browse the community by</div>
          <Collapse activeKey={collapseKeys} onChange={handleCollapseChange}>
            <Collapse.Panel
              key="p1"
              header={<h4 className="h-xs w-semi">Resource Type</h4>}
            >
              <div className="filters">
                {types.map((type) => (
                  <FilterToggle
                    key={type.name}
                    onToggle={() => handleTypeToggle(type.value)}
                    isSelected={filters.types.includes(type.value)}
                  >
                    {type.name}
                  </FilterToggle>
                ))}
              </div>
            </Collapse.Panel>
            <Collapse.Panel
              key="p2"
              header={<h4 className="h-xs w-semi">Geography</h4>}
            >
              <div className="filters">
                {featuredOptions.map((type) => (
                  <FilterToggle
                    key={type.name}
                    onToggle={() => handleGeoToggle(type.id)}
                    isSelected={filters.transnational.includes(type.id)}
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
                virtual={false}
                onChange={handleCountryChange}
              />
            </Collapse.Panel>
          </Collapse>
        </div>
      </aside>
      <div className="content">
        {loading && (
          <div className="loading">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
          </div>
        )}
        <div className="results">
          {results?.map((result) => (
            <Link
              href={`/${result.type}/${result.id}`}
              onClick={handleClick(result)}
            >
              <StakeholderCard
                item={result}
                key={`${result.type}-${result.id}`}
                className="resource-card"
                // onBookmark={() => {}}
                // onClick={showModal}
              />
            </Link>
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
        visible={modalVisible}
        setVisible={setModalVisible}
        isServer={false}
        {...{
          setLoginVisible,
          isAuthenticated,
          profile,
          openItem,
        }}
      />
    </div>
  )
}

const formatFilters = (filters) => {
  const $filters = { ...filters }
  if (filters.types.length === 1) {
    $filters.networkType = $filters.types[0]
  }
  $filters.transnational = $filters.transnational.join(',')
  $filters.country = $filters.country.join(',')
  delete $filters.types

  return $filters
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
      `${API_ENDPOINT}/community?${params.toString()}`
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

export default CommunityHub
