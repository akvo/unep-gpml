import React, { useEffect, useState, useCallback } from 'react'
import {
  Card,
  Button,
  Row,
  Col,
  Select,
  Spin,
  Modal,
  message,
  notification,
} from 'antd'
import { fetchSubmissionData } from '../../modules/profile/utils'
import { t, Trans } from '@lingui/macro'
import api from '../../utils/api'
import DetailModal from '../../modules/details-page/modal'
import bodyScrollLock from '../../modules/details-page/scroll-utils'
import { useRouter } from 'next/router'

const { confirm } = Modal

const Resource = ({ isAuthenticated, setLoginVisible }) => {
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [status, setStatus] = useState('SUBMITTED')
  const [hasMore, setHasMore] = useState(true)
  const [params, setParams] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  const fetchData = useCallback(
    async (currentPage, currentLimit, currentStatus, append = false) => {
      setLoading(true)
      try {
        const result = await fetchSubmissionData(
          currentPage,
          currentLimit,
          'resources',
          currentStatus
        )

        setData((prevData) =>
          append ? [...prevData, ...result.data] : result.data
        )

        // Calculate if there are more pages based on total count
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
    setPage(1) // Reset page when status changes
    fetchData(1, limit, status, false) // false ensures data isn't appended
  }, [status, limit, fetchData])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchData(nextPage, limit, status, true)
  }

  const handleStatusChange = (value) => {
    setStatus(value)
    setData([]) // Clear existing data when status changes
    setHasMore(true) // Reset hasMore state
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
      <Spin spinning={loading && page === 1}>
        <div className="card-container">
          {data?.map((item) => (
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
          ))}
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
