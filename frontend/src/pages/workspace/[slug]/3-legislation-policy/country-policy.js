import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Modal, Table, Tooltip, message } from 'antd'
import classNames from 'classnames'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'

import { PageLayout } from '..'
import {
  BookmarkIcon,
  ValidatePolicyIcon,
  VerifiedBadgeIcon,
} from '../../../../components/icons'
import styles from './country-policy.module.scss'
import api from '../../../../utils/api'
import bodyScrollLock from '../../../../modules/details-page/scroll-utils'
import DetailsView from '../../../../modules/details-page/view'

const { Column } = Table

const PAGE_SIZE = 20
const sectionKey = 'country-policy'

const CountryPolicyModal = ({
  open,
  onClose,
  match,
  isAuthenticated,
  setLoginVisible,
}) => {
  return (
    <Modal
      maskClosable
      destroyOnClose
      visible={open}
      width={1054}
      className={styles.modalView}
      onCancel={onClose}
      footer={
        <>
          <Button className="invalidate" ghost>
            Invalidate
          </Button>
          <Button type="primary">
            Validate Policy
            <ValidatePolicyIcon />
          </Button>
        </>
      }
    >
      <DetailsView
        type={match?.params?.type}
        id={match?.params?.id}
        {...{
          match,
          isAuthenticated,
          setLoginVisible,
        }}
      />
    </Modal>
  )
}

const CountryPolicyTable = ({ psItem, setLoginVisible, isAuthenticated }) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [policy, setPolicy] = useState(null)
  const [open, setOpen] = useState(false)
  const [pagination, setPagination] = useState({
    pageSize: PAGE_SIZE,
    current: 1,
  })
  const [params, setParams] = useState(null)
  const [tableFilters, setTableFilters] = useState([])

  const paginationProp =
    pagination?.total && pagination.total > PAGE_SIZE ? pagination : false

  const columns = useMemo(() => {
    const [
      _,
      filterTitles,
      filterTypes,
      filterStatus,
      filterTags,
      filterGeo,
    ] = tableFilters
    return [
      {
        title: '',
        dataIndex: 'plasticStrategyBookmarks',
      },
      {
        title: 'Year',
        dataIndex: 'created',
        sorter: (a, b) => a.created - b.created,
      },
      {
        title: 'Title',
        dataIndex: 'title',
        filters: filterTitles || [],
        onFilter: (value, record) => record.title.indexOf(value) === 0,
        sorter: (a, b) => a.title.localeCompare(b.title),
      },
      {
        title: 'Type',
        dataIndex: 'typeOfLaw',
        filters: filterTypes || [],
        onFilter: (value, record) => record.typeOfLaw.indexOf(value) === 0,
        sorter: (a, b) => a.typeOfLaw.localeCompare(b.typeOfLaw),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        filters: filterStatus || [],
        onFilter: (value, record) => record.status.indexOf(value) === 0,
        sorter: (a, b) => a.status.localeCompare(b.status),
      },
      {
        title: 'Tags',
        dataIndex: 'tags',
        filters: filterTags || [],
        onFilter: (value, record) =>
          record?.tags?.find((t) => t?.tag === value),
        sorter: (a, b) => a.tags - b.tags,
      },
      {
        title: 'Geo-coverage',
        dataIndex: 'geoCoverageType',
        filters: filterGeo || [],
        onFilter: (value, record) =>
          record.geoCoverageType.indexOf(value) === 0,
        sorter: (a, b) => a.geoCoverageType - b.geoCoverageType,
      },
    ]
  }, [tableFilters])

  const closeModal = () => {
    setOpen(false)
    setPolicy(null)
  }

  const showModal = ({ type, id }) => {
    if (type && id) {
      const detailUrl = `/${type}/${id}`
      setParams({ type, id })
      window.history.pushState({}, '', detailUrl)
      setOpen(true)
      bodyScrollLock.enable()
    }
  }

  const handleToggleBookmark = async (record, isMarked = false) => {
    const payload = {
      bookmark: !isMarked,
      entity_id: record?.id,
      entity_type: 'policy',
      section_key: sectionKey,
    }
    const _data = data.map((d) => {
      if (d?.id === record?.id) {
        const plasticStrategyBookmarks = payload.bookmark
          ? [
              {
                plasticStrategyId: psItem?.id,
                sectionKey,
              },
            ]
          : null
        return {
          ...d,
          plasticStrategyBookmarks,
        }
      }
      return d
    })
    setData(_data)
    try {
      await api.post(
        `/plastic-strategy/${psItem?.country?.isoCodeA2}/bookmark`,
        payload
      )
    } catch (error) {
      console.error('Unable to update the bookmark status', error)
      message.error('Unable to update the bookmark status')
      /**
       * Undo the changes if something goes wrong
       */
      const _data = data.map((d) => (e?.id === record?.id ? record : d))
      setData(_data)
    }
  }

  const mapFilter = (row, field) => ({
    text: row[field],
    value: row[field],
  })

  const getAllPolicies = useCallback(async () => {
    if (!psItem?.id) {
      return
    }
    const page = pagination.current - 1
    let queryString = `?page=${page}&limit=${pagination.pageSize}`
    queryString += `&ps_country_iso_code_a2=${psItem?.country?.isoCodeA2}`
    queryString += `&country=${psItem?.country?.id}&topic=policy`
    try {
      const { data: apiData } = await api.get(`/browse${queryString}`)
      const { results, counts } = apiData || {}
      const _data = results?.map((r) => ({
        ...r,
        verified: false, // TODO
      }))
      setData(_data)
      if (pagination?.total === undefined) {
        setPagination({
          ...pagination,
          total: counts?.[0]?.count || 0,
        })
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }, [psItem, pagination])

  useEffect(() => {
    getAllPolicies()
  }, [getAllPolicies])

  useEffect(() => {
    if (data.length && !tableFilters.length) {
      const filterTitles = uniqBy(data, 'title').map((d) =>
        mapFilter(d, 'title')
      )
      const filterTypes = uniqBy(data, 'typeOfLaw').map((d) =>
        mapFilter(d, 'typeOfLaw')
      )
      const filterStatus = uniqBy(data, 'status').map((d) =>
        mapFilter(d, 'status')
      )
      const allTags = data.flatMap((d) => d?.tags)
      const filterTags = uniqBy(allTags, 'tag').map((d) => mapFilter(d, 'tag'))
      const filterGeo = uniqBy(data, 'geoCoverageType').map((d) =>
        mapFilter(d, 'geoCoverageType')
      )
      setTableFilters([
        null,
        filterTitles,
        filterTypes,
        filterStatus,
        filterTags,
        filterGeo,
      ])
    }
  }, [data, tableFilters])

  return (
    <>
      <Table
        dataSource={data}
        loading={loading}
        pagination={paginationProp}
        onChange={(_pagination) => {
          console.log('_pagination', _pagination)
          setPagination({
            ...pagination,
            ..._pagination,
          })
        }}
      >
        {columns.map((col, cx) => {
          if (col.dataIndex === 'plasticStrategyBookmarks') {
            return (
              <Column
                key={cx}
                {...col}
                render={(bookmarks, record) => {
                  const findBm = bookmarks?.find(
                    (b) =>
                      b?.plasticStrategyId === psItem?.id &&
                      b?.sectionKey === sectionKey
                  )
                  const isMarked = findBm ? true : false
                  return (
                    <a
                      role="button"
                      onClick={() => handleToggleBookmark(record, isMarked)}
                      className={classNames({ bookmarked: isMarked })}
                    >
                      <BookmarkIcon />
                    </a>
                  )
                }}
              />
            )
          }
          if (col.dataIndex === 'title') {
            return (
              <Column
                key={cx}
                {...col}
                render={(value, record) => {
                  return (
                    <Button
                      type="link"
                      onClick={() => showModal(record)}
                    >
                      <span
                        className={classNames('icon', {
                          verified: record?.verified,
                        })}
                      >
                        {record?.verified && <VerifiedBadgeIcon />}
                      </span>
                      <span>{value}</span>
                    </Button>
                  )
                }}
              />
            )
          }
          if (col.dataIndex === 'tags') {
            return (
              <Column
                key={cx}
                {...col}
                render={(values) => {
                  const stringTags = values?.map(({ tag }) => tag)?.join(', ')
                  return (
                    <Tooltip placement="top" title={stringTags}>
                      <div>{stringTags}</div>
                    </Tooltip>
                  )
                }}
              />
            )
          }
          if (col.dataIndex === 'created') {
            return (
              <Column
                key={cx}
                {...col}
                render={(dateValue) => {
                  return <span>{moment(dateValue).format('YYYY')}</span>
                }}
              />
            )
          }
          return <Column key={cx} {...col} />
        })}
      </Table>
      <CountryPolicyModal
        onClose={closeModal}
        match={{ params }}
        {...{ open, policy, isAuthenticated, setLoginVisible }}
      />
    </>
  )
}

const View = ({ psItem, setLoginVisible, isAuthenticated }) => (
  <div className={styles.countryPolicyView}>
    <div className="title-section">
      <h4 className="caps-heading-m">Legislation & Policy Review Report</h4>
      <h2 className="h-xxl w-bold">Country Policy Framework</h2>
    </div>
    <div className="desc-section">
      <p>
        Find country initiatives across a wide variety of subjects and sectors
        currently ongoing. Filter either directly on the map or using the
        sidebar navigation to easily find relevant initatives.
      </p>
    </div>
    <div className="table-section">
      <CountryPolicyTable {...{ psItem, setLoginVisible, isAuthenticated }} />
    </div>
  </div>
)

View.getLayout = PageLayout

export default View