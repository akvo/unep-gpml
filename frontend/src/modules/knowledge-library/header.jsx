import React, { useState } from 'react'
import { Row, Col, Button, Input } from 'antd'
import { SearchOutlined, AppstoreOutlined } from '@ant-design/icons'
import styles from './header.module.scss'
import { KNOWLEDGE_LIBRARY } from '../map/map'
import { eventTrack } from '../../utils/misc'
import { useRouter } from 'next/router'
import GlobeIcon from '../../images/transnational.svg'
import { SearchIcon, FilterIcon } from '../../components/icons'

const KnowledgeLibrarySearch = ({
  router,
  updateQuery,
  isShownForm,
  setIsShownForm,
}) => {
  const [search, setSearch] = useState('')
  const handleSearch = (src) => {
    eventTrack('Communities', 'Search', 'Button')
    if (src) {
      router.push(`?q=${src.trim()}`)
      updateQuery('q', src.trim())
    } else {
      updateQuery('q', '')
    }
    setSearch('')
    setIsShownForm(false)
  }

  return (
    <>
      <div className="src mobile-src">
        <Input
          className="input-src"
          placeholder="Search resources"
          value={search}
          suffix={<SearchOutlined />}
          onPressEnter={(e) => handleSearch(e.target.value)}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="src desktop-src">
        <Input
          className="input-src"
          placeholder="Search resources"
          value={search}
          suffix={<SearchOutlined />}
          onPressEnter={(e) => handleSearch(e.target.value)}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </>
  )
}

const StakeholderOverviewSearch = ({
  router,
  updateQuery,
  setView,
  isShownForm,
  setIsShownForm,
}) => {
  const [search, setSearch] = useState('')
  const handleSearch = (src) => {
    eventTrack('Knowledge library', 'Search', 'Button')
    if (src) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, q: src.trim() },
        },
        undefined,
        { shallow: true }
      )

      updateQuery('q', src.trim())
    } else {
      updateQuery('q', '')
    }
    setSearch(src)
    setIsShownForm(false)
  }

  return (
    <>
      <div className="src mobile-src">
        <Input
          className="input-src"
          placeholder="Search profiles"
          value={search}
          prefix={<SearchIcon />}
          onPressEnter={(e) => handleSearch(e.target.value)}
          onChange={(e) => {
            setSearch(e.target.value)
            if (e.target.value.length >= 3) {
              router.push(`?q=${e.target.value.trim()}`)
              updateQuery('q', e.target.value.trim())
            }
            if (e.target.value.length === 0) {
              updateQuery('q', '')
            }
          }}
        />
      </div>
      <div className="src desktop-src">
        <Input
          size="small"
          className="input-src"
          placeholder="Search profiles"
          value={search}
          prefix={<SearchIcon />}
          onPressEnter={(e) => handleSearch(e.target.value)}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
        />
      </div>
    </>
  )
}

const Header = ({
  setView,
  filterVisible,
  setFilterVisible,
  filterTagValue,
  renderFilterTag,
  updateQuery,
  view,
}) => {
  const router = useRouter()
  const path = router.pathname

  const [isShownForm, setIsShownForm] = useState(false)

  return (
    <Col span={24} className={`${styles.uiHeader} ui-header`}>
      <div className={`${styles.uiContainer} ui-container`}>
        <Row
          type="flex"
          justify="space-between"
          align="middle"
          className="header-filter-option"
        >
          {/* Search input & filtered by list */}
          <Col lg={22} md={20} sm={18}>
            <Row type="flex" justify="space-between" align="middle">
              <div className="search-box search-box-mobile">
                {/* <Search updateQuery={updateQuery} /> */}
                {path === KNOWLEDGE_LIBRARY ? (
                  <KnowledgeLibrarySearch
                    {...{ updateQuery, isShownForm, setIsShownForm, router }}
                  />
                ) : (
                  <StakeholderOverviewSearch
                    {...{ updateQuery, isShownForm, setIsShownForm, router }}
                  />
                )}
                <Button
                  onClick={() => {
                    setFilterVisible(!filterVisible)
                    path === KNOWLEDGE_LIBRARY
                      ? eventTrack('Knowledge library', 'Filter', 'Button')
                      : eventTrack('Communities', 'Filter', 'Button')
                  }}
                  className="filter-icon-button"
                  type="link"
                >
                  {filterTagValue.length > 0 && (
                    <div className="filter-status">{filterTagValue.length}</div>
                  )}
                  <FilterIcon />
                  Filters
                </Button>
              </div>
              {/* {filterTagValue.length > 0 && (
                <Col lg={19} md={17} sm={15} className="filter-tag">
                  <Space direction="horizontal">{renderFilterTag()}</Space>
                </Col>
              )} */}
            </Row>
          </Col>
          {/* Map/Topic view dropdown */}
          <button
            className="view-button"
            shape="round"
            size="large"
            onClick={() => {
              view === 'map' ? setView('grid') : setView('map')
            }}
          >
            <div className="view-button-text ">
              Switch to {`${view === 'map' ? 'grid' : 'map'}`} view
            </div>
            {view === 'map' ? <AppstoreOutlined /> : <GlobeIcon />}
          </button>
        </Row>
      </div>
    </Col>
  )
}

export default Header
