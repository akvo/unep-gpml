import React, { useEffect, useState, useCallback } from 'react'
import { Button, Select, Spin, Modal, message, notification, Input } from 'antd'
import { fetchSubmissionData } from '../../modules/profile/utils'
import { t, Trans } from '@lingui/macro'
import api from '../../utils/api'
import DetailModal from '../../modules/details-page/modal'
import bodyScrollLock from '../../modules/details-page/scroll-utils'
const { Option } = Select
const { confirm } = Modal

const Resource = ({ isAuthenticated, setLoginVisible }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [status, setStatus] = useState('SUBMITTED')
  const [hasMore, setHasMore] = useState(true)
  const [params, setParams] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [searchTitle, setSearchTitle] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)

  const fetchData = useCallback(
    async (
      currentPage,
      currentLimit,
      currentStatus,
      append = false,
      titleSearch = ''
    ) => {
      setLoading(true)
      try {
        const result = await fetchSubmissionData(
          currentPage,
          currentLimit,
          'resources',
          currentStatus,
          titleSearch
        )

        setData((prevData) =>
          append ? [...prevData, ...result.data] : result.data
        )

        const hasMorePages = currentPage * currentLimit < result.count
        setHasMore(hasMorePages)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    setPage(1)
    fetchData(1, limit, status, false, searchTitle)
  }, [status, limit, fetchData, searchTitle])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchData(nextPage, limit, status, true, searchTitle)
  }

  const handleStatusChange = (value) => {
    setStatus(value)
    setData([])
    setHasMore(true)
  }

  const handleSearch = (value) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      setSearchTitle(value)
      setData([])
      setPage(1)
      setHasMore(true)
    }, 500)

    setSearchTimeout(timeout)
  }

  const showDeleteConfirm = (record) => {
    const deleteResource = {
      id: record.id,
      item_type: record.topic,
      review_status: 'REJECTED',
    }
    confirm({
      title: 'Are you sure you want to decline this resource?',
      okText: 'Decline',
      okType: 'danger',
      cancelText: 'Cancel',
      cancelButtonProps: {
        type: 'link',
        size: 'small',
      },
      okButtonProps: {
        size: 'small',
      },
      okType: 'default',
      onOk() {
        return api
          .put(`/submission`, deleteResource)
          .then(() => {
            notification.success({ message: 'Resource declined successfully' })
            setData((prevData) =>
              prevData.filter((item) => item.id !== record.id)
            )
          })
          .catch((error) => {
            message.error('Failed to decline resource')
          })
      },
    })
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

  const approveResource = (record) => {
    const approveResource = {
      id: record.id,
      item_type: record.topic,
      review_status: 'APPROVED',
    }
    api
      .put(`/submission`, approveResource)
      .then(() => {
        notification.success({ message: 'Resource approved successfully' })
        setData((prevData) => prevData.filter((item) => item.id !== record.id))
      })
      .catch((error) => {
        message.error('Failed to approve resource')
      })
  }

  // Determine if load more button should be shown
  const shouldShowLoadMore = !loading && hasMore && data.length > 0

  return (
    <div className="resource-view">
      <div className="resource-header">
        <p>
          {status === 'SUBMITTED'
            ? 'Pending approval'
            : status === 'APPROVED'
            ? 'Approved Resources'
            : 'Declined Resources'}
        </p>

        <div className="filter-controls">
          <Input
            placeholder="Search for a resource"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300, marginRight: 10 }}
            allowClear
            size="small"
          />
          <Select
            size="small"
            showSearch
            placeholder="Filter by Status"
            allowClear
            showArrow
            value={status}
            onChange={handleStatusChange}
            style={{ width: 300 }}
          >
            <Option value="APPROVED">Published</Option>
            <Option value="SUBMITTED">Pending</Option>
            <Option value="REJECTED">Declined</Option>
          </Select>
        </div>
      </div>
      <Spin spinning={loading && page === 1}>
        <div className="card-container">
          {data?.length > 0
            ? data.map((item) => (
                <div
                  className="card-wrapper"
                  key={item.id}
                  onClick={(e) => showModal({ e, item })}
                >
                  <div className="resource-card">
                    <p>{item.title}</p>
                    <span className="badge">{item.type.replace('_', ' ')}</span>
                  </div>
                  {status === 'SUBMITTED' && (
                    <div className="card-actions">
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          approveResource(item)
                        }}
                      >
                        <Trans>Approve</Trans>
                      </Button>
                      <Button
                        size="small"
                        danger
                        ghost
                        className="decline-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          showDeleteConfirm(item)
                        }}
                      >
                        <Trans>Decline</Trans>
                      </Button>
                    </div>
                  )}
                </div>
              ))
            : !loading && <p className="no-results">No resources found</p>}
        </div>
      </Spin>
      <div>
        {shouldShowLoadMore ? (
          <Button
            className="load-more-button"
            size="small"
            ghost
            onClick={handleLoadMore}
            loading={loading && page > 1}
          >
            Load More
          </Button>
        ) : (
          data.length > 0 &&
          !loading && <p className="no-data">No more data to load</p>
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

export default Resource
