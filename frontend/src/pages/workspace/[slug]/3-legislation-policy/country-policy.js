import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Modal, Table, Tooltip, message, notification } from 'antd'
import classNames from 'classnames'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import { Trans, t } from '@lingui/macro'
import { PageLayout } from '..'
import {
  BookmarkIconProper,
  ValidatePolicyIcon,
  VerifiedBadgeIcon,
  badges,
} from '../../../../components/icons'
import styles from './country-policy.module.scss'
import api from '../../../../utils/api'
import bodyScrollLock from '../../../../modules/details-page/scroll-utils'
import DetailsView from '../../../../modules/details-page/view'
import { useRouter } from 'next/router'

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
  const handleAssignBadge = async (e, id, entityName, assign) => {
    e.stopPropagation()

    const data = {
      assign: assign,
      entity_id: id,
      entity_type: entityName,
    }

    api
      .post(`/badge/country-validated/assign`, data)
      .then((resp) => {
        notification.success({
          message: `Your request to ${
            assign ? 'add' : 'remove'
          } country-validated has been approved!`,
        })
      })
      .catch((err) => {
        console.log(err)
        notification.error({
          message: err?.response?.data?.errorDetails?.error
            ? err?.response?.data?.errorDetails?.error
            : 'Something went wrong',
        })
      })
  }

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
          {/* <Button className="invalidate" ghost>
            <Trans>Invalidate</Trans>
          </Button> */}
          <Button
            className="country-validate-btn"
            onClick={(e) =>
              handleAssignBadge(e, match?.params?.id, match?.params?.type, true)
            }
            type="primary"
          >
            <Trans>Validate Policy</Trans>
            {false && <Trans>Validated</Trans>}
            {badges.verified}
            {/* <ValidatePolicyIcon /> */}
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
  const router = useRouter()
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
        title: t`Year`,
        dataIndex: 'created',
        sorter: (a, b) => a.created - b.created,
      },
      {
        title: t`Title`,
        dataIndex: 'title',
        filters: filterTitles || [],
        onFilter: (value, record) => record.title.indexOf(value) === 0,
        sorter: (a, b) => a.title.localeCompare(b.title),
      },
      {
        title: t`Type`,
        dataIndex: 'typeOfLaw',
        filters: filterTypes || [],
        onFilter: (value, record) => record.typeOfLaw.indexOf(value) === 0,
        sorter: (a, b) => a.typeOfLaw.localeCompare(b.typeOfLaw),
      },
      {
        title: t`Status`,
        dataIndex: 'status',
        filters: filterStatus || [],
        onFilter: (value, record) => record.status.indexOf(value) === 0,
        sorter: (a, b) => a.status.localeCompare(b.status),
      },
      {
        title: t`Tags`,
        dataIndex: 'tags',
        filters: filterTags || [],
        onFilter: (value, record) =>
          record?.tags?.find((t) => t?.tag === value),
        sorter: (a, b) => a.tags - b.tags,
      },
      {
        title: t`Geo-coverage`,
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

  useEffect(() => {
    if (!open) {
      const previousHref = router.asPath
      window.history.pushState(
        { urlPath: `/${previousHref}` },
        '',
        `${previousHref}`
      )
    }
  }, [open])

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
    queryString += `&country=${psItem?.country?.id}&topic=policy&badges=true`
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
                    <Tooltip
                      title={
                        isMarked ? t`Remove from Library` : t`Save to Library`
                      }
                    >
                      <a
                        role="button"
                        onClick={() => handleToggleBookmark(record, isMarked)}
                        className={classNames({ bookmarked: isMarked })}
                      >
                        <BookmarkIconProper />
                      </a>
                    </Tooltip>
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
                    <Button type="link" onClick={() => showModal(record)}>
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
                  // const stringTags = values?.map(({ tag }) => tag)?.join(', ')
                  const threshold = 3
                  return (
                    <div className="tag-list">
                      {values.slice(0, threshold).map((tag) => (
                        <span className="tag">{tag.tag}</span>
                      ))}
                      {values.length > threshold && (
                        <Tooltip
                          title={values
                            .slice(threshold)
                            .map((it) => it.tag)
                            .join(', ')}
                        >
                          <span className="plus-more">
                            +{values.length - threshold} more
                          </span>
                        </Tooltip>
                      )}
                    </div>
                    // <Tooltip placement="top" title={stringTags}>
                    //   <div>{stringTags}</div>
                    // </Tooltip>
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
      <h4 className="caps-heading-m">
        <Trans>Legislation & Policy Review Report</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Country Policy Framework</Trans>
      </h2>
    </div>
    <div className="desc-section">
      <p>
        <Trans>Description - Section 3 - Coutry Policy Framework</Trans>
        {/* Find country initiatives across a wide variety of subjects and sectors
        currently ongoing. Filter either directly on the map or using the
        sidebar navigation to easily find relevant initatives. */}
      </p>
    </div>
    <div className="table-section">
      <CountryPolicyTable {...{ psItem, setLoginVisible, isAuthenticated }} />
    </div>
  </div>
)

View.getLayout = PageLayout

export default View
