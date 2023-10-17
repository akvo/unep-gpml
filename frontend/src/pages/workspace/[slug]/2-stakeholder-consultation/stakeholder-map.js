import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Avatar, Button, Table, Tooltip, Typography } from 'antd'
import classNames from 'classnames'
import kebabCase from 'lodash/kebabCase'
import Image from 'next/image'

import { PageLayout } from '..'
import { BookmarkIcon } from '../../../../components/icons'
import AutocompleteForm from '../../../../components/autocomplete-form/autocomplete-form'
import ModalAddEntity from '../../../../modules/flexible-forms/entity-modal/add-entity-modal'
import styles from './stakeholder-map.module.scss'
import api from '../../../../utils/api'
import { UIStore } from '../../../../store'
import { titleCase } from '../../../../utils/string'

const { Column } = Table
const { Text } = Typography

const PAGE_SIZE = 10
const dummy = [
  {
    key: 1,
    name: 'Akvo Foundation',
    type: 'NGO',
    geo_coverage: 'Global',
    tags: [
      {
        id: 943,
        tag: 'raw materials',
        private: false,
      },
    ],
    focal_point: ['DP', 'AS'],
    strengths: 'Data owner',
    status: 'bookmark',
  },
  {
    key: 2,
    name: 'Org Name 2',
    type: 'Private sector',
    geo_coverage: 'National',
    tags: [],
    focal_point: ['MS'],
    strengths: '5 Initiatives',
    status: 'bookmarked',
  },
  {
    key: 3,
    name: 'Org name 3',
    type: 'IGO',
    geo_coverage: 'Global',
    tags: [
      {
        id: 947,
        tag: 'development stage',
        private: false,
      },
      {
        id: 948,
        tag: 'establishment - company type',
        private: false,
      },
    ],
    focal_point: ['PP', 'DA'],
    strengths: null,
    status: 'bookmark',
  },
]

const columns = [
  {
    title: 'Organisation',
    dataIndex: 'name',
    filters: [
      {
        text: 'Akvo Foundation',
        value: 'akvo',
      },
      {
        text: 'Org name 1',
        value: 'Org name 1',
      },
      {
        text: 'Org name 2',
        value: 'Org name 2',
      },
    ],
    sorter: (a, b) => a.name.length - b.name.length,
    sortDirections: ['ascend'],
  },
  {
    title: 'Type',
    dataIndex: 'type',
    filters: [
      {
        text: 'NGO',
        value: 'NGO',
      },
      {
        text: 'Private sector',
        value: 'Private sector',
      },
      {
        text: 'IGO',
        value: 'IGO',
      },
    ],
    sorter: (a, b) => a.type - b.type,
  },
  {
    title: 'Geo-coverage',
    dataIndex: 'geo_coverage',
    filters: [
      {
        text: 'Global',
        value: 'global',
      },
      {
        text: 'National',
        value: 'national',
      },
    ],
    sorter: (a, b) => a.geo_coverage - b.geo_coverage,
  },
  {
    title: 'Lifecycle Stage',
    dataIndex: 'tags',
    filters: [
      {
        text: 'London',
        value: 'London',
      },
      {
        text: 'New York',
        value: 'New York',
      },
    ],
  },
  {
    title: 'Focal Point',
    dataIndex: 'focal_point',
    sorter: (a, b) => a.focal_point - b.focal_point,
  },
  {
    title: 'Strengths',
    dataIndex: 'strengths',
    sorter: (a, b) => a.strengths - b.strengths,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    sorter: (a, b) => a.status - b.status,
  },
]

const StakeholderMapTable = ({ psItem }) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [tableParams, setTableParams] = useState({
    networkType: 'organisation',
    limit: PAGE_SIZE,
    page: 1,
  })
  const allTags = UIStore.useState((s) => s.tags)

  const handleTableChange = (pagination, filters, sorter) => {
    const sorterParams =
      sorter?.column?.dataIndex && sorter?.order
        ? { [sorter.column.dataIndex]: sorter.order }
        : {}
    const filterParams = Object.values(filters)
      ?.map((value, vx) => ({
        [columns?.[vx]?.dataIndex]: value?.join(','),
      }))
      ?.filter((value, vx) => value?.[columns?.[vx]?.dataIndex])
      ?.reduce((prev, curr) => Object.assign(prev, curr), {})
    setTableParams({
      ...sorterParams,
      ...filterParams,
      networkType: 'organisation',
      limit: pagination?.pageSize || PAGE_SIZE,
      filters,
      sorter,
      pagination,
      page: pagination?.current,
    })
  }

  const paginationProps = useMemo(() => {
    if (tableParams?.pagination?.total > PAGE_SIZE) {
      return tableParams.pagination
    }
    return false
  }, [tableParams.pagination])

  const fakeStakeholderMapApi = useCallback(async () => {
    setLoading(true)
    try {
      const { pagination, filters, sorter, ...params } = tableParams
      const { data } = await api.get('/community', {
        ...params,
      })
      const { results, counts } = data || {}
      // TODO
      const _data = dummy.map((d) => ({
        ...d,
        tags: d?.tags?.map((d) => d?.tag),
      }))
      setData(_data)

      if (!tableParams?.pagination?.total) {
        setTableParams({
          ...tableParams,
          pagination: {
            current: params?.page,
            pageSize: PAGE_SIZE,
            total: counts?.[0]?.count,
          },
        })
      }
      setLoading(false)
    } catch (error) {
      console.error('Unable to fetch stakeholder maps data', error)
      setLoading(false)
    }
  }, [tableParams?.pagination, tableParams?.filters, tableParams?.sorter])

  useEffect(() => {
    fakeStakeholderMapApi()
  }, [fakeStakeholderMapApi])

  return (
    <Table
      loading={loading}
      dataSource={data}
      rowKey={(record) => record.key}
      pagination={paginationProps}
      onChange={handleTableChange}
    >
      {columns.map((col, cx) => {
        if (col.dataIndex === 'status') {
          return (
            <Column
              {...col}
              key={cx}
              render={(data) => {
                return (
                  <Button
                    type="link"
                    icon={<BookmarkIcon />}
                    className={classNames({ [data]: data })}
                  >
                    {data}
                  </Button>
                )
              }}
            />
          )
        }
        if (col.dataIndex === 'focal_point') {
          return (
            <Column
              {...col}
              key={cx}
              render={(data) => {
                return (
                  <div className="data-with-avatar">
                    {data?.map((d) => (
                      <Avatar size={37}>{d}</Avatar>
                    ))}
                  </div>
                )
              }}
            />
          )
        }
        if (col.dataIndex === 'tags') {
          return (
            <Column
              {...col}
              key={cx}
              render={(tags) => {
                return (
                  <div className="data-with-avatar">
                    {tags?.map((tag, tx) => (
                      <Tooltip key={tx} title={titleCase(tag)} placement="right">
                        <span className="img-circle">
                          <Image
                            src={`/cat-tags/${kebabCase(tag)}.svg`}
                            alt={tag}
                            width={24}
                            height={24}
                          />
                        </span>
                      </Tooltip>
                    ))}
                  </div>
                )
              }}
            />
          )
        }
        return <Column {...col} key={cx} />
      })}
    </Table>
  )
}

const StakeholderMapForm = () => {
  const [showModal, setShowModal] = useState(false)
  const [org, setOrg] = useState(null)
  return (
    <>
      <h5 className={styles.title}>Can't find who you're looking for?</h5>
      <AutocompleteForm
        apiParams={{ networkType: 'organisation', limit: 10 }}
        extraButton={{
          text: '+ Add a New Organisation',
          type: 'link',
          onClick: () => setShowModal(true),
        }}
        onSelect={(item) => console.log('item', item)}
        renderItem={(item) => {
          if (item?.onClick) {
            return (
              <Button type={item.type} onClick={item.onClick}>
                {item.text}
              </Button>
            )
          }
          return <Text>{item?.name}</Text>
        }}
      />
      <ModalAddEntity
        visible={showModal}
        close={() => setShowModal(!showModal)}
        setEntity={setOrg}
      />
    </>
  )
}

const View = ({ psItem }) => (
  <div className={styles.stakeholderMapView}>
    <div className="title-section">
      <h4 className="caps-heading-m">stakeholder consultation process</h4>
      <h2 className="h-xxl w-bold">Stakeholder Map</h2>
    </div>
    <div className="desc-section">
      <p>Find and connect the stakeholders relevant to you</p>
    </div>
    <div className="table-section">
      <StakeholderMapTable psItem={psItem} />
    </div>
    <div className="add-section">
      <StakeholderMapForm />
    </div>
  </div>
)

View.getLayout = PageLayout

export default View
