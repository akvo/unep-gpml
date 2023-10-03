import React from 'react'
import { Row, Col, Space, Drawer, Tag, Card, Button } from 'antd'
import { CloseCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import humps from 'humps'
import isEmpty from 'lodash/isEmpty'
import { UIStore } from '../../store'
import { entityName, networkNames, networkTypes } from '../../utils/misc'

import MultipleSelectFilter from '../../components/select/multiple-select-filter'
import CountryTransnationalFilter from '../../components/select/country-transnational-filter'

import BusinessIcon from '../../images/stakeholder-overview/business-icon.svg'
import AchievementIcon from '../../images/stakeholder-overview/medal-icon.svg'
import PartnerIcon from '../../images/stakeholder-overview/partner-icon.svg'
import GPMLLogo from '../../images/stakeholder-overview/gpml-logo.svg'
import CommunityIcon from '../../images/stakeholder-overview/community-outlined.svg'
import UnionIcon from '../../images/stakeholder-overview/union-outlined.svg'

const FilterDrawer = ({
  query,
  view,
  updateQuery,
  entities,
  filterVisible,
  setFilterVisible,
  stakeholderCount,
  setFilterCountries,
  multiCountryCountries,
  setMultiCountryCountries,
  renderFilterTag,
  history,
}) => {
  const {
    seeking,
    offering,
    countries,
    organisations,
    representativeGroup,
    transnationalOptions,
    geoCoverageTypeOptions,
    tags,
  } = UIStore.useState((s) => ({
    seeking: s.tags.seeking,
    offering: s.tags.offering,
    countries: s.countries,
    organisations: s.organisations,
    representativeGroup: s.representativeGroup,
    transnationalOptions: s.transnationalOptions,
    geoCoverageTypeOptions: s.geoCoverageTypeOptions,
    tags: Object.values(s.tags).flat(),
  }))

  const entityIcon = (name) => {
    if (name.toLowerCase() === 'owner') {
      return <GPMLLogo />
    }
    if (name.toLowerCase() === 'implementor') {
      return <AchievementIcon />
    }
    if (name.toLowerCase() === 'partner') {
      return <PartnerIcon />
    }
    if (name.toLowerCase() === 'donor') {
      return <BusinessIcon />
    }
  }

  const networkIcon = (name) => {
    if (name.toLowerCase() === 'stakeholder') {
      return <UnionIcon />
    }
    if (name.toLowerCase() === 'organisation') {
      return <CommunityIcon />
    }
  }

  const filterQueries = [
    'country',
    'networkType',
    'representativeGroup',
    'geoCoverageType',
    'seeking',
    'offering',
    'affiliation',
    'isMember',
    'transnational',
  ]

  const handleChangeType = (flag, type) => {
    const val = query[flag]

    let updateVal = []
    if (isEmpty(val)) {
      updateVal = [type]
    } else if (val.includes(type)) {
      updateVal = val.filter((x) => x !== type)
    } else {
      updateVal = [...val, type]
    }
    updateQuery(flag, updateVal)
  }

  const queryToRefresh = Object.fromEntries(
    Object.entries(query).filter(([key]) => key !== 'page' && key !== 'q')
  )

  const queryValues = Object.values(queryToRefresh).flat()

  const representativeOpts = !isEmpty(representativeGroup)
    ? [...representativeGroup, { code: 'other', name: 'Other' }].map((x) => ({
        label: x?.name,
        value: x?.name,
      }))
    : []

  const filterTagValue = renderFilterTag()
    .flat()
    .filter((item) => item)

  return (
    <div
      className={`site-drawer-render-in-current-wrapper ${
        view?.toLowerCase() === 'map' && 'map-view-drawer'
      }`}
    >
      <Drawer
        tabIndex=""
        tabindex=""
        title="Choose your filters below"
        placement="left"
        visible={filterVisible}
        getContainer={false}
        onClose={() => setFilterVisible(false)}
        closeIcon={
          <>
            {filterTagValue.length > 0 ? (
              <span className="apply-button">Apply</span>
            ) : (
              <CloseCircleOutlined className="drawer-close-icon" />
            )}
          </>
        }
        style={{ position: 'absolute' }}
        height="100%"
        autoFocus={false}
      >
        {/* Filter content */}
        <Row type="flex" gutter={[0, 24]}>
          <Col span={24} className="network-card-filter">
            <Space align="middle">
              <div className="filter-title">Network type</div>
              {isEmpty(query?.networkType) ? (
                <Tag className="selection-card-type filter-title">
                  All (default)
                </Tag>
              ) : (
                <Tag
                  className="clear-selection"
                  closable={true}
                  onClose={() => updateQuery('networkType', [])}
                  onClick={() => updateQuery('networkType', [])}
                >
                  Clear selection
                </Tag>
              )}
            </Space>

            <Row type="flex" gutter={[10, 10]}>
              {networkTypes.map((networkType) => {
                return (
                  <Col
                    span={6}
                    key={networkType}
                    className="resource-card-wrapper"
                  >
                    <Card
                      onClick={() =>
                        handleChangeType('networkType', networkType)
                      }
                      className={classNames('drawer-card', {
                        active: query?.networkType?.includes(networkType),
                      })}
                    >
                      <Space direction="vertical" align="center">
                        {networkIcon(networkType)}
                        <div className="topic-text">
                          {networkNames(networkType)}
                        </div>
                        <div className="topic-text topic-counts">
                          {networkType === 'organisation'
                            ? stakeholderCount?.entity
                            : stakeholderCount?.individual}
                        </div>
                      </Space>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </Col>

          {/* For entities */}
          <Col span={24} className="specificity-card">
            <Space align="middle">
              {!isEmpty(query?.isMember) && (
                <Tag
                  className="clear-selection"
                  closable={true}
                  onClose={() => updateQuery('isMember', '')}
                  onClick={() => updateQuery('isMember', '')}
                >
                  Clear selection
                </Tag>
              )}
            </Space>

            <Row type="flex" gutter={[10, 0]}>
              <p className="specificity-title">For entities</p>
              {[entities[0]].map((entity) => {
                const name = humps.decamelize(entity)

                return (
                  name && (
                    <Col span={6} key={entity}>
                      <Card
                        onClick={() => handleChangeType('isMember', 'true')}
                        className={classNames('drawer-card', {
                          active: query?.isMember?.includes('true'),
                        })}
                      >
                        <Space
                          direction="vertical"
                          align="center"
                          className="for-entity"
                        >
                          {entityIcon(name)}
                          <div className="topic-text">{entityName(name)}</div>
                          <div className="topic-text topic-counts">
                            {stakeholderCount?.GPMLMemberCount}
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  )
                )
              })}
            </Row>
          </Col>

          {/* Affiliation */}
          <MultipleSelectFilter
            title="Affiliation"
            options={
              !isEmpty(organisations)
                ? organisations
                    ?.map((x) => ({ value: x.id, label: x.name }))
                    .filter(
                      (organisation) =>
                        organisation?.value > -1 ||
                        organisation?.label?.length === 0
                    )
                : []
            }
            value={query?.affiliation?.map((x) => parseInt(x)) || []}
            flag="affiliation"
            query={query}
            updateQuery={updateQuery}
          />
          {/* Location */}
          <Col span={24} style={{ paddingTop: 5, paddingBottom: 5 }}>
            <Space align="middle" style={{ alignItems: 'center' }}>
              <div className="filter-title">Location</div>
              {!isEmpty(query?.country) ? (
                <Tag
                  className="clear-selection"
                  closable
                  onClick={() => {
                    updateQuery('country', [])
                  }}
                  onClose={() => updateQuery('country', [])}
                >
                  Clear Country Selection
                </Tag>
              ) : (
                ''
              )}
              {!isEmpty(query?.transnational) ? (
                <Tag
                  className="clear-selection"
                  closable
                  onClick={() => {
                    updateQuery('transnational', [])
                    setMultiCountryCountries([])
                  }}
                  onClose={() => updateQuery('transnational', [])}
                >
                  Clear Multi-Country Selection
                </Tag>
              ) : (
                ''
              )}
            </Space>
            <div className="country-filter-tab-wrapper">
              <CountryTransnationalFilter
                {...{
                  query,
                  updateQuery,
                  multiCountryCountries,
                  setMultiCountryCountries,
                  history,
                }}
                country={query?.country?.map((x) => parseInt(x)) || []}
                multiCountry={
                  query?.transnational?.map((x) => parseInt(x)) || []
                }
                multiCountryLabelCustomIcon={true}
                countrySelectMode="multiple"
                multiCountrySelectMode="multiple"
                isCommunity={true}
              />
            </div>
          </Col>
          {/*Geo-coverage*/}
          <MultipleSelectFilter
            title="Geo-coverage"
            options={
              !isEmpty(geoCoverageTypeOptions)
                ? [...geoCoverageTypeOptions, 'Sub-national']
                    .sort((a, b) => a.localeCompare(b))
                    ?.map((x) => ({
                      value: x,
                      label:
                        x?.toLowerCase() === 'sub-national' ? 'Subnational' : x,
                    }))
                : []
            }
            value={query?.geoCoverageType || []}
            flag="geoCoverageType"
            query={query}
            updateQuery={updateQuery}
          />

          {/*Expertise to offer*/}
          <MultipleSelectFilter
            title="What expertises are they offering?"
            options={
              !isEmpty(tags)
                ? tags?.map((x) => ({ value: x.tag, label: x.tag }))
                : []
            }
            value={query?.offering || []}
            flag="offering"
            query={query}
            updateQuery={updateQuery}
          />

          {/* Expertise they seek */}
          <MultipleSelectFilter
            title="What expertises are they seeking?"
            options={
              !isEmpty(tags)
                ? tags?.map((x) => ({ value: x.tag, label: x.tag }))
                : []
            }
            value={query?.seeking || []}
            flag="seeking"
            query={query}
            updateQuery={updateQuery}
          />
          {/* Representative group */}
          <MultipleSelectFilter
            title="Representative group"
            options={
              !isEmpty(representativeGroup)
                ? representativeOpts.map((x) => ({
                    value: x?.value,
                    label: x.label,
                  }))
                : []
            }
            value={query?.representativeGroup || []}
            flag="representativeGroup"
            query={query}
            updateQuery={updateQuery}
          />

          <Col className="drawer-button-wrapper">
            <Button
              type="link"
              disabled={queryValues.length === 0}
              className={
                queryValues.length > 0
                  ? 'clear-all-btn'
                  : 'clear-all-btn disabled'
              }
              onClick={() => {
                if (queryValues.length > 0) {
                  const paramValueArr = filterQueries.map((query) => ({
                    param: query,
                    value: [],
                  }))
                  setFilterCountries([])
                  updateQuery(null, null, paramValueArr)
                }
              }}
            >
              <CloseCircleOutlined />
              Clear all filters
            </Button>
          </Col>
        </Row>
      </Drawer>
    </div>
  )
}

export default FilterDrawer
