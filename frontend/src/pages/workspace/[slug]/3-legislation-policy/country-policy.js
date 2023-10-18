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

const { Column } = Table
const { Text } = Typography

const tagPolicies = [
  'Legislations',
  'Regulations & Standards - Prohibitive Regulations',
  'Bans & Restrictions',
  'Strategies & Action Plans',
  'Economic Instruments',
  'Certification',
  'Licensing and Registration - Policy Guidance and Information',
]

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
          {policy?.tags?.map((tag, tx) => (
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

const CountryPolicyTable = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [policy, setPolicy] = useState(null)
  const [open, setOpen] = useState(false)

  const columns = [
    {
      title: '',
      dataIndex: 'verified',
      hidden: true,
    },
    {
      title: '',
      dataIndex: 'star',
    },
    {
      title: 'Year',
      dataIndex: 'year',
      filters: [{ text: '2015', value: 2015 }],
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      filters: Array.from({ length: 5 }).map((_, index) => ({
        text: `Policy name ${index + 1}`,
        value: `Policy name ${index + 1}`,
      })),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      filters: [
        { text: 'Action plan', value: 'action plan' },
        { text: 'Legislation', value: 'legislation' },
      ],
      sorter: (a, b) => a.type.localeCompare(b.type),
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
      dataIndex: 'geo_coverage_type',
      filters: [{ text: 'National', value: 'national' }],
      sorter: (a, b) => a.geo_coverage_type - b.geo_coverage_type,
    },
  ]

  const dummy = [
    {
      key: 1,
      star: true,
      verified: false,
      year: 2015,
      title: 'Policy name 1',
      type: 'legislation',
      status: 'replealed',
      tags: tagPolicies.slice(0, 2),
      geo_coverage_type: 'national',
    },
    {
      key: 2,
      star: false,
      verified: true,
      year: 2019,
      title: 'Policy name 2',
      type: 'Action plan',
      status: 'replealed',
      tags: tagPolicies.slice(1, 5),
      geo_coverage_type: 'national',
    },
  ]

  const handleOnCloseModal = () => {
    setOpen(false)
    setPolicy(null)
  }

  const getAllPolicies = useCallback(async () => {
    try {
      await new Promise((resolve, _) => {
        // TODO
        setTimeout(() => {
          setData(dummy)
          setLoading(false)
          resolve()
        }, 3000)
      })
    } catch (error) {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getAllPolicies()
  }, [getAllPolicies])
  return (
    <>
      <Table dataSource={data} loading={loading} pagination={false}>
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
                    const stringTags = values?.join(', ')
                    return (
                      <Tooltip placement="top" title={stringTags}>
                        <div>{stringTags}</div>
                      </Tooltip>
                    )
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

const View = () => (
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
      <CountryPolicyTable />
    </div>
  </div>
)

View.getLayout = PageLayout

export default View
