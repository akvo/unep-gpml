import React, { useEffect, useState } from 'react'
import { AppstoreOutlined, LoadingOutlined } from '@ant-design/icons'
import styles from './styles.module.scss'
import api from '../../utils/api'
import { UIStore } from '../../store'
import catTags from '../../utils/cat-tags.json'
import { isEmpty } from 'lodash'
import { useQuery } from '../../utils/misc'
import SortIcon from '../../images/knowledge-library/sort-icon.svg'
import GlobeIcon from '../../images/transnational.svg'

import Maps from '../map/map'
import ExpertCarousel from './expert-carousel'
import FilterBar from './filter-bar'
import InviteExpertModal from './invite-expert-modal'
import ExpertCard from './expert-card'
import UnathenticatedPage from '../stakeholder-overview/unathenticated-page'
import InviteExpertCard from './invite-expert-card'
import { Trans, t } from '@lingui/macro'

const Experts = ({ isAuthenticated, setLoginVisible, loadingProfile }) => {
  const { countries, organisations } = UIStore.useState((s) => ({
    countries: s.countries,
    organisations: s.organisations,
  }))

  let box = ''
  const query = useQuery()

  const [view, setView] = useState('map')
  const [experts, setExperts] = useState({
    experts: [],
    count: 0,
    countryGroupCounts: [],
  })
  const [isAscending, setIsAscending] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterCountries, setFilterCountries] = useState([])
  const [filter, setFilter] = useState([])
  const [isShownModal, setIsShownModal] = useState(false)
  const [unAthenticatedModal, setUnathenticatedModal] = useState(false)

  useEffect(() => {
    const boxes = document.getElementsByClassName('experts')
    if (boxes && boxes.length > 0) {
      box = boxes[0]
    }
  }, [])

  const fetchExperts = (params) => {
    const url = `/stakeholder/expert/list`
    api
      .get(url, { page_size: 100, page_n: 0, ...params })
      .then((resp) => {
        const data = resp?.data
        setExperts({
          experts: data.experts,
          count: data.count,
          countryGroupCounts: data.countByCountry,
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  const sortExperts = (ascending) => {
    const sortedExperts = experts?.experts?.sort((a, b) => {
      if (ascending) {
        if (a?.firstName) {
          return a?.firstName?.trim().localeCompare(b?.firstName?.trim())
        } else {
          return a?.name?.trim().localeCompare(b?.name?.trim())
        }
      } else {
        if (b?.firstName) {
          return b?.firstName?.trim().localeCompare(a?.firstName?.trim())
        } else {
          return b?.name?.trim().localeCompare(a?.name?.trim())
        }
      }
    })
    setIsAscending(ascending)
    setExperts({ ...experts, experts: sortedExperts })
  }

  useEffect(() => {
    fetchExperts()
  }, [])

  const clickCountry = (value) => {
    let updateVal = []
    if (isEmpty(filterCountries)) {
      updateVal = [value]
    } else if (filterCountries.includes(value)) {
      updateVal = filterCountries.filter((x) => x !== value)
    } else {
      updateVal = [...filterCountries, value]
    }
    setFilterCountries(updateVal)
  }

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (filter.length > 1 && filter[1].length > 0) {
      params.tags = filter[1].join(',')
    } else if (
      filter.length === 1 ||
      (filter.length === 2 && filter[1].length === 0)
    ) {
      params.tags = catTags[filter[0]].topics.join(',')
    }
    if (filterCountries.length > 0) {
      params.countries = filterCountries.join(',')
    }
    fetchExperts(params)
  }, [filter, filterCountries])

  useEffect(() => {
    if (!isAuthenticated && loadingProfile) {
      setUnathenticatedModal(true)
    }
  }, [isAuthenticated, loadingProfile])

  return (
    <div id="experts" className={`${styles.experts} experts`}>
      <FilterBar
        {...{ filter, setFilter, filterCountries, setFilterCountries }}
      />
      <div className="expert-list-section">
        <div className="list-toolbar">
          <div className="page-label">
            <Trans>Total</Trans> {experts?.count}
          </div>
          <button
            className="view-button"
            shape="round"
            size="large"
            onClick={() => {
              view === 'map' ? setView('grid') : setView('map')
            }}
          >
            <div className="view-button-text ">
              <Trans>Switch to</Trans> {`${view === 'map' ? 'grid' : 'map'}`}{' '}
              <Trans>view</Trans>
            </div>
            {view === 'map' ? <AppstoreOutlined /> : <GlobeIcon />}
          </button>
          <button
            className="sort-by-button"
            onClick={() => sortExperts(!isAscending)}
          >
            <SortIcon
              style={{
                transform:
                  isAscending || isAscending === null
                    ? 'initial'
                    : 'rotate(180deg)',
              }}
            />
            <div className="sort-button-text">
              <span>
                <Trans>Sort by:</Trans>
              </span>
              <b>{isAscending ? `A>Z` : 'Z>A'}</b>
            </div>
          </button>
        </div>
        {loading && (
          <div className="loading">
            <LoadingOutlined spin />
          </div>
        )}
        {/* {experts.experts.length === 0 && !loading && (
              <div className="noresults">No matches</div>
            )} */}
        {view === 'map' ? (
          <ExpertCarousel
            {...{
              experts,
              countries,
              organisations,
              setIsShownModal,
              loading,
            }}
          />
        ) : (
          <div className="grid">
            {experts.experts.map((expert) => (
              <ExpertCard {...{ expert, countries, organisations }} />
            ))}
            <InviteExpertCard {...{ setIsShownModal }} />
          </div>
        )}
      </div>
      {view === 'map' && (
        <Maps
          box={box}
          query={query}
          clickEvents={clickCountry}
          stakeholderCount={[]}
          listVisible={[]}
          isDisplayedList={[]}
          dataToDisplay={[]}
          isFilteredCountry={filterCountries}
          data={
            (experts &&
              experts?.countryGroupCounts?.map((item) => {
                return {
                  countryId: item.countryId,
                  counts: { experts: item.counts },
                }
              })) ||
            []
          }
          countryGroupCounts={experts?.countryGroupCounts || []}
          isLoaded={() => true}
          multiCountryCountries={[]}
          multiCountries={[]}
          useVerticalLegend
          path="experts"
          zoom={0.9}
        />
      )}
      <InviteExpertModal {...{ setIsShownModal, isShownModal }} />
      <UnathenticatedPage
        {...{ unAthenticatedModal, setLoginVisible, setUnathenticatedModal }}
      />
    </div>
  )
}

export default Experts
