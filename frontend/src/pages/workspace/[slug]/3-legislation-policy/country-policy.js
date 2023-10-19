import React, { useCallback, useEffect, useState } from 'react'
import { Button, List, Modal, Table, Tag, Tooltip, Typography } from 'antd'
import classNames from 'classnames'
import { PageLayout } from '..'
import {
  ArrowExternalIcon,
  BookmarkIcon,
  PDFIcon,
  ValidatePolicyIcon,
  VerifiedBadgeIcon,
} from '../../../../components/icons'
import styles from './country-policy.module.scss'
import api from '../../../../utils/api'
import moment from 'moment'

const { Column } = Table
const { Text } = Typography

const PAGE_SIZE = 10

const CountryPolicyModal = ({ open, onClose, policy }) => {
  const dummyResources = [
    {
      id: 1,
      label: 'Sub Content Type',
      value: 'Economic Instruments',
    },
    {
      id: 2,
      label: 'Original Title',
      value:
        'Articles 58 à 60 de la Loi de Finances n° 2002-0101 du 17 décembre 2002 pour l&#039;année 2003',
    },
  ]
  return (
    <Modal
      visible={open}
      width={1054}
      className={styles.modalView}
      footer={
        <>
          <Button type="link" onClick={onClose}>
            Close
          </Button>
          <Button className="invalidate" ghost>
            Invalidate
          </Button>
          <Button type="primary">
            Validate Policy
            <ValidatePolicyIcon />
          </Button>
        </>
      }
      title={
        <>
          <strong className="caps-heading-m">Policy</strong>
          <h3>{policy?.title}</h3>
          <div>
            <ul className="group-buttons">
              <li>
                <Button size="small">
                  View Attachment
                  <PDFIcon />
                </Button>
              </li>
              <li>
                <Button size="small" className="external-icon" ghost>
                  View Source
                  <ArrowExternalIcon />
                </Button>
              </li>
              <li>
                <Button size="small" ghost>
                  Bookmark
                </Button>
              </li>
              <li>
                <Button size="small" ghost>
                  Share
                </Button>
              </li>
            </ul>
          </div>
        </>
      }
    >
      <div className="tags-section">
        <strong className="caps-heading-s">Tags</strong>
        <div className="tags">
          {policy?.tags?.map(({ tag }, tx) => (
            <Tag key={tx}>{tag}</Tag>
          ))}
        </div>
      </div>
      <div className="records-section">
        <strong className="caps-heading-s">Records</strong>
        <List
          bordered={false}
          dataSource={dummyResources}
          renderItem={(item) => (
            <List.Item key={item?.id}>
              <Text className="h-xs">{item.label}</Text>
              <Text className="h-xs value" strong>
                {item.value}
              </Text>
            </List.Item>
          )}
        />
      </div>
    </Modal>
  )
}

const CountryPolicyTable = ({ psItem }) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [policy, setPolicy] = useState(null)
  const [open, setOpen] = useState(false)
  const [pagination, setPagination] = useState({
    pageSize: PAGE_SIZE,
    current: 1,
  })

  const paginationProp =
    pagination?.total && pagination.total > PAGE_SIZE ? pagination : false

  const columns = [
    {
      title: '',
      dataIndex: 'verified', // TODO
      hidden: true,
    },
    {
      title: '',
      dataIndex: 'star', // TODO
    },
    {
      title: 'Year',
      dataIndex: 'created',
      filters: [],
      sorter: (a, b) => a.created - b.created,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      filters: [],
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Type',
      dataIndex: 'typeOfLaw',
      filters: [],
      sorter: (a, b) => a.typeOfLaw.localeCompare(b.typeOfLaw),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      filters: [{ text: 'Repealed', value: 'repealed' }],
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      filters: [{ text: 'Legislations', value: 'legislations' }],
      sorter: (a, b) => a.tags - b.tags,
    },
    {
      title: 'Geo-coverage',
      dataIndex: 'geoCoverageType',
      filters: [],
      sorter: (a, b) => a.geoCoverageType - b.geoCoverageType,
    },
  ]

  const handleOnCloseModal = () => {
    setOpen(false)
    setPolicy(null)
  }

  const getAllPolicies = useCallback(async () => {
    if (!psItem?.id) {
      return
    }
    console.log('p', pagination)
    const page = pagination.current - 1
    let queryString = `?page=${page}&limit=${pagination.pageSize}`
    queryString += `&ps_country_iso_code_a2=${psItem?.country?.isoCodeA2}`
    queryString += `&country=${psItem?.country?.id}&topic=policy`
    try {
      const { data: apiData } = await api.get(`/browse${queryString}`)
      const { results, counts } = apiData || {}
      const _data = results?.map((r) => ({
        ...r,
        star: false, // TODO
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
        {columns
          .filter((col) => !col?.hidden)
          .map((col, cx) => {
            if (col.dataIndex === 'star') {
              return (
                <Column
                  key={cx}
                  {...col}
                  render={(value, record) => {
                    return (
                      <a
                        role="button"
                        onClick={() => console.log('id', record?.key)}
                        className={classNames({ bookmarked: value })}
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
                        onClick={() => {
                          setPolicy(record)
                          setOpen(true)
                        }}
                      >
                        <span className="icon">
                          {record?.verified && <VerifiedBadgeIcon />}
                        </span>
                        <span>{` ${value}`}</span>
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
      <CountryPolicyModal {...{ open, policy }} onClose={handleOnCloseModal} />
    </>
  )
}

const View = ({ psItem }) => (
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
      <CountryPolicyTable psItem={psItem} />
    </div>
  </div>
)

View.getLayout = PageLayout

export default View
