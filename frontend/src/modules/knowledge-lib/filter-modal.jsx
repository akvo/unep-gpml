import React, { useEffect, useState } from 'react'
import styles from './filter.module.scss'
import {
  Row,
  Col,
  Space,
  Checkbox,
  Input,
  Button,
  DatePicker,
  Modal,
} from 'antd'
import moment from 'moment'
import { useAuth0 } from '@auth0/auth0-react'
import isEmpty from 'lodash/isEmpty'
import values from 'lodash/values'
import flatten from 'lodash/flatten'
import { eventTrack } from '../../utils/misc'
import { UIStore } from '../../store'
import { SearchOutlined } from '@ant-design/icons'
import MultipleSelectFilter from '../../components/select/multiple-select-filter'
import { SearchIcon } from '../../components/icons'
import { Trans, t } from '@lingui/macro'

const FilterModal = ({
  query,
  setShowFilterModal,
  showFilterModal,
  fetchData,
  asPath,
  history,
  setGridItems,
  pathname,
}) => {
  const {
    tags,
    representativeGroup,
    mainContentType,
    organisations,
  } = UIStore.useState((s) => ({
    profile: s.profile,
    tags: s.tags,
    mainContentType: s.mainContentType,
    representativeGroup: s.representativeGroup,
    organisations: s.organisations,
  }))
  const { isAuthenticated } = useAuth0()
  const [
    tagsExcludingCapacityBuilding,
    setTagsExcludingCapacityBuilding,
  ] = useState([])

  const [isClearFilter, setIsClearFilter] = useState(false)
  const [filter, setFilter] = useState({})

  const updateQuery = (param, value) => {
    const newQuery = { ...filter }
    newQuery[param] = value
    // Remove empty query
    const arrayOfQuery = Object.entries(newQuery)?.filter(
      (item) =>
        item[1]?.length !== 0 &&
        typeof item[1] !== 'undefined' &&
        item[1] !== null
    )

    const pureQuery = Object.fromEntries(arrayOfQuery)

    setFilter(pureQuery)
  }

  useEffect(() => {
    if (Object.keys(query).length > 0) setFilter(query)
  }, [query])

  const filteredMainContentOptions = !isEmpty(mainContentType)
    ? mainContentType
        .filter((content) => {
          const resourceName = (name) => {
            if (name === 'initiative') {
              return 'initiative'
            } else if (name === 'event_flexible') {
              return 'event'
            } else if (name === 'financing') {
              return 'financing_resource'
            } else if (name === 'technical') {
              return 'technical_resource'
            } else if (name === 'action') {
              return 'action_plan'
            } else {
              return name
            }
          }
          return query?.topic?.includes(resourceName(content?.code))
        })
        .sort((a, b) => a?.code.localeCompare(b?.code))
    : []

  const mainContentOption = () => {
    if (query?.topic?.length > 0) {
      return filteredMainContentOptions
    } else if (query?.topic?.length === 0 || !query?.topic) {
      return mainContentType
    }
  }

  // populate options for tags dropdown
  const tagsWithoutSpace =
    !isEmpty(tags) &&
    flatten(values(tags)).map((it) => ({
      value: it?.tag?.trim(),
      label: it?.tag?.trim(),
    }))

  const tagOpts = !isEmpty(tags)
    ? [...new Set(tagsWithoutSpace.map((s) => JSON.stringify(s)))]
        .map((s) => JSON.parse(s))
        ?.sort((tag1, tag2) => tag1?.label.localeCompare(tag2?.label))
    : []

  // populate options for representative group options
  const representativeOpts = !isEmpty(representativeGroup)
    ? [...representativeGroup, { code: 'other', name: 'Other' }].map((x) => ({
        label: x?.name,
        value: x?.name,
      }))
    : []

  useEffect(() => {
    if (isClearFilter) {
      updateQuery('tag', tagsExcludingCapacityBuilding)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsExcludingCapacityBuilding])

  const handleApplyFilter = () => {
    setGridItems([])
    setShowFilterModal(false)

    const newQuery = {
      ...filter,
    }

    const newParams = new URLSearchParams(newQuery)
    newParams.delete('totalCount')
    newParams.delete('slug')
    history.push({
      pathname: asPath,
      query: newParams.toString(),
    })
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

  const resetFilter = () => {
    const newQuery = {}
    setShowFilterModal(false)
    const newParams = new URLSearchParams(newQuery)
    history.push({
      pathname: pathname,
      search: newParams.toString(),
    })
  }

  const isEmptyQuery = Object.values(query).every(
    (x) => x === null || x === undefined || x?.length === 0
  )

  return (
    <Modal
      centered
      className={styles.filterModal}
      title={<Trans>Filters</Trans>}
      visible={showFilterModal}
      footer={null}
      onCancel={() => setShowFilterModal(false)}
      // footer={[
      //   <Button
      //     size="small"
      //     key="submit"
      //     className="apply-button"
      //     onClick={() => handleApplyFilter()}
      //   >
      //     <Trans>Apply Filters</Trans>
      //   </Button>,
      //   <Button
      //     className="clear-button"
      //     onClick={() => setShowFilterModal(false)}
      //     type="link"
      //   >
      //     <Trans>Cancel</Trans>
      //   </Button>,
      //   <Button
      //     className="clear-button"
      //     onClick={() => setShowFilterModal(false)}
      //     type="link"
      //   >
      //     <Trans>Reset Filter</Trans>
      //   </Button>,
      // ]}
    >
      <Row type="flex" gutter={[0, 24]}>
        {/* My Bookmarks */}
        {isAuthenticated && (
          <Col span={24} style={{ paddingTop: 5, paddingBottom: 5 }}>
            <Space align="middle">
              <Checkbox
                className="favorites-checkbox"
                checked={query?.favorites?.indexOf('true') > -1}
                onChange={({ target: { checked } }) =>
                  updateQuery('favorites', checked)
                }
              >
                <Trans>My Bookmarks</Trans>
              </Checkbox>
            </Space>
          </Col>
        )}

        <KnowledgeLibrarySearch {...{ updateQuery, filter }} />

        {/* Sub-content type */}
        <MultipleSelectFilter
          title={<Trans>Sub-content type</Trans>}
          options={
            !isEmpty(mainContentType)
              ? mainContentOption().map((content) => {
                  const label =
                    content?.name?.toLowerCase() === 'capacity building'
                      ? 'Capacity Development'
                      : content?.name
                  return {
                    label: label,
                    options: content?.childs
                      .map((child, i) => ({
                        label: child?.title,
                        value: child?.title,
                        key: `${i}-${content?.name}`,
                      }))
                      .sort((a, b) =>
                        a?.label?.trim().localeCompare(b?.label?.trim())
                      ),
                  }
                })
              : []
          }
          value={filter?.subContentType || []}
          flag="subContentType"
          query={query}
          updateQuery={updateQuery}
        />

        {/* Tags */}
        <MultipleSelectFilter
          title={<Trans>Tags</Trans>}
          options={tagOpts || []}
          value={filter?.tag?.map((x) => x) || []}
          flag="tag"
          query={query}
          updateQuery={updateQuery}
        />

        <MultipleSelectFilter
          title={<Trans>Entities</Trans>}
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
          value={filter?.entity?.map((x) => parseInt(x)) || []}
          flag="entity"
          query={query}
          updateQuery={updateQuery}
          clear={false}
        />

        <MultipleSelectFilter
          title={<Trans>Representative group</Trans>}
          options={
            !isEmpty(representativeGroup)
              ? representativeOpts.map((x) => ({
                  value: x?.value,
                  label: x.label,
                }))
              : []
          }
          value={filter?.representativeGroup || []}
          flag="representativeGroup"
          query={query}
          updateQuery={updateQuery}
          clear={false}
        />

        {/* Date Filter */}
        <Col
          span={24}
          className="date-picker-container"
          style={{ paddingTop: 5, paddingBottom: 5 }}
        >
          <Row type="flex" style={{ width: '100%' }} gutter={[10, 10]}>
            {/* Start date */}
            <DatePickerFilter
              title={<Trans>Start Date</Trans>}
              value={filter?.startDate}
              flag="startDate"
              query={query}
              updateQuery={updateQuery}
              span={12}
              startDate={
                !isEmpty(filter?.startDate)
                  ? moment(filter?.startDate[0])
                  : null
              }
            />
            {/* End date */}
            <DatePickerFilter
              title={<Trans>End Date</Trans>}
              value={filter?.endDate}
              flag="endDate"
              query={query}
              updateQuery={updateQuery}
              span={12}
              endDate={
                !isEmpty(filter?.endDate) ? moment(filter?.endDate[0]) : null
              }
            />
          </Row>
        </Col>
        <div className="footer">
          {!isEmptyQuery &&
            Object.keys(query).filter(
              (item) =>
                !hideFilterList.includes(item) &&
                item !== 'slug' &&
                item !== 'totalCount'
            ).length > 0 && (
              <Button
                className="clear-button"
                onClick={() => resetFilter()}
                type="link"
              >
                <Trans>Reset Filter</Trans>
              </Button>
            )}
          <div className="action-buttons">
            <Button
              size="small"
              key="submit"
              className="apply-button"
              onClick={() => handleApplyFilter()}
            >
              <Trans>Apply Filters</Trans>
            </Button>
            <Button
              className="clear-button"
              onClick={() => setShowFilterModal(false)}
              type="link"
            >
              <Trans>Cancel</Trans>
            </Button>
          </div>
        </div>
      </Row>
    </Modal>
  )
}

const DatePickerFilter = ({
  title,
  value,
  query,
  flag,
  updateQuery,
  span = 24,
  startDate = null,
}) => {
  return (
    <Col span={span}>
      <Space align="middle">
        <div className="filter-title multiple-filter-title">{title}</div>
      </Space>
      <div>
        <DatePicker
          size="small"
          placeholder={t`YYYY`}
          picker={'year'}
          value={
            !isEmpty(value)
              ? flag.toLowerCase() === 'startdate'
                ? moment(value).startOf('year')
                : moment(value).endOf('year')
              : ''
          }
          onChange={(val) =>
            updateQuery(flag, val ? moment(val).format('YYYY-MM-DD') : null)
          }
          disabledDate={(current) => {
            // Can not select days past start date
            if (startDate) {
              return current <= startDate
            }
            return null
          }}
        />
      </div>
    </Col>
  )
}

const KnowledgeLibrarySearch = ({ updateQuery, filter }) => {
  const [search, setSearch] = useState('')
  const handleSearch = (src) => {
    eventTrack('Communities', 'Search', 'Button')
    if (src) {
      updateQuery('q', src)
    } else {
      updateQuery('q', '')
    }
    setSearch(src)
  }

  return (
    <>
      <div className="search-input">
        <Input
          size="small"
          className="input-search"
          placeholder={t`Search resources`}
          value={filter?.q}
          prefix={<SearchIcon />}
          onPressEnter={(e) => handleSearch(e.target.value)}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
    </>
  )
}

export default FilterModal
