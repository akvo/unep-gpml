import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Avatar, Button, Table, Tooltip, Typography } from 'antd'
import classNames from 'classnames'
import { kebabCase, uniqBy, snakeCase } from 'lodash'
import { useRouter } from 'next/router'

import { PageLayout } from '..'
import {
  BookmarkIcon,
  DesignNProdIcon,
  DistributionIcon,
  EndOfLifeIcon,
  PetroExtractionIcon,
  ConsumptionIcon,
} from '../../../../components/icons'
import AutocompleteForm from '../../../../components/autocomplete-form/autocomplete-form'
import ModalAddEntity from '../../../../modules/flexible-forms/entity-modal/add-entity-modal'
import styles from './stakeholder-map.module.scss'
import api from '../../../../utils/api'

const { Column } = Table
const { Text } = Typography

const PAGE_SIZE = 10
const PREFIX_TAG = 'stakeholder'
const FILTER_FIELDS = {
  name: 'name',
  type: 'types',
  geo_coverage_type: 'geo_coverage_types',
}

export const PLASTIC_LIFECYCLE = [
  {
    text: 'Petrochemical Extraction',
    value: 'petrochemical extraction',
    icon: PetroExtractionIcon,
  },
  {
    text: 'Design & Production',
    value: 'design & production',
    icon: DesignNProdIcon,
  },
  {
    text: 'Distribution',
    value: 'distribution',
    icon: DistributionIcon,
  },
  {
    text: 'Consumption',
    value: 'consumption',
    icon: ConsumptionIcon,
  },
  {
    text: 'End of Life',
    value: 'end-of-life',
    icon: EndOfLifeIcon,
  },
]

const StakeholderMapTable = ({ psItem }) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [tableParams, setTableParams] = useState({ limit: PAGE_SIZE })
  const [tableFilters, setTableFilters] = useState([])
  const router = useRouter()

  const paginationProps = useMemo(() => {
    if (tableParams?.pagination?.total > PAGE_SIZE) {
      return tableParams.pagination
    }
    return false
  }, [tableParams.pagination])

  const columns = useMemo(() => {
    const [filterNames, filterTypes, filterGeo] = tableFilters
    return [
      {
        title: '',
        dataIndex: 'status',
        sorter: true,
      },
      {
        title: 'Organisation',
        dataIndex: 'name',
        filters: filterNames || [],
        sorter: true,
        sortDirections: ['ascend'],
      },
      {
        title: 'Type',
        dataIndex: 'type',
        filters: filterTypes || [],
        sorter: true,
      },
      {
        title: 'Geo-coverage',
        dataIndex: 'geoCoverageType',
        filters: filterGeo || [],
        sorter: true,
      },
      {
        title: 'Lifecycle Stage',
        dataIndex: 'tags',
        filters: PLASTIC_LIFECYCLE,
      },
      {
        title: 'Focal Point',
        dataIndex: 'focalPoints',
      },
      {
        title: 'Strengths',
        dataIndex: 'strengths',
      },
    ]
  }, [tableFilters])

  const handleTableChange = (pagination, filters, sorter) => {
    const sorterParams =
      sorter?.column?.dataIndex && sorter?.order
        ? {
            order_by: snakeCase(sorter.column.dataIndex),
            descending: sorter.order === 'descend' ? 'true' : 'false',
          }
        : {}
    /**
     * Transform filter from antd table to query params to send to backend
     */
    const filterParams = Object.values(filters)
      ?.map((value, vx) => ({
        [snakeCase(columns?.[vx + 1]?.dataIndex)]: value, // convert camelCase to snake_case
      }))
      ?.filter((value, vx) => value?.[snakeCase(columns?.[vx + 1]?.dataIndex)])
      ?.reduce((prev, curr) => Object.assign(prev, curr), {})
    /**
     * Save query params on local state.
     */
    setTableParams({
      ...sorterParams,
      ...filterParams,
      limit: pagination?.pageSize || PAGE_SIZE,
      filters,
      sorter,
      pagination,
    })
  }

  const mapFilter = (row, field) => ({
    text: row[field],
    value: row[field],
  })

  const getStakeholderMapApi = useCallback(async () => {
    setLoading(true)
    if (!psItem?.id) {
      return
    }
    try {
      const { pagination, filters, sorter, ...params } = tableParams
      const countryTag = `${PREFIX_TAG}-${kebabCase(psItem.country.name)}`
      const page = pagination?.current ? pagination.current - 1 : 0
      /**
       * Convert object to string query params
       * due query array is not support in the backend
       * eg: types[]=foo&types=bar
       * tobe: types=foo&types=bar
       */
      const tags = params?.tags || []
      const allParams = {
        ...params,
        tags: [...tags, countryTag],
      }
      const queryString = Object.keys(allParams)
        .flatMap((field) => {
          if (Array.isArray(allParams[field])) {
            return allParams[field].map((value) => {
              const fieldName = FILTER_FIELDS?.[field] || field
              const queryVal = value?.replace(/&/g, '%26')
              return `${fieldName}=${queryVal}`
            })
          }
          return [`${field}=${allParams[field]}`]
        })
        .join('&')

      const { data } = await api.get(
        `/organisations?page=${page}&${queryString}`
      )
      const { results, counts } = data || {}
      const _data = results.map((r) => ({
        ...r,
        status: false, // TODO bookmark status
      }))
      setData(_data)

      if (tableParams?.pagination?.total === undefined) {
        setTableParams({
          ...tableParams,
          pagination: {
            current: 1,
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
  }, [
    tableParams?.pagination,
    tableParams?.filters,
    tableParams?.sorter,
    psItem,
  ])

  useEffect(() => {
    getStakeholderMapApi()
  }, [getStakeholderMapApi])

  useEffect(() => {
    if (data.length && !tableFilters.length) {
      const filterNames = uniqBy(data, 'name').map((d) => mapFilter(d, 'name'))
      const filterTypes = uniqBy(data, 'type').map((d) => mapFilter(d, 'type'))
      const filterGeo = uniqBy(data, 'geoCoverageType').map((d) =>
        mapFilter(d, 'geoCoverageType')
      )
      setTableFilters([filterNames, filterTypes, filterGeo])
    }
  }, [data, tableFilters])

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
              render={(isMarked) => {
                return (
                  <Button
                    type="link"
                    className={classNames({ bookmarked: isMarked })}
                  >
                    <BookmarkIcon />
                  </Button>
                )
              }}
            />
          )
        }
        if (col.dataIndex === 'focalPoints') {
          return (
            <Column
              {...col}
              key={cx}
              render={(values) => {
                return (
                  <div className="data-with-avatar">
                    {values?.map((v, vx) => (
                      <Tooltip
                        key={vx}
                        placement="top"
                        title={`${v?.firstName} ${v?.lastName || ''}`}
                      >
                        <Avatar size={37}>
                          {v?.firstName?.[0]} {v?.lastName?.[0]}
                        </Avatar>
                      </Tooltip>
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
                    {tags
                      ?.filter((t) => !t?.private)
                      ?.map(({ tag }, tx) => {
                        const findPL = PLASTIC_LIFECYCLE.find(
                          (l) => l.value === tag
                        )
                        if (!findPL) {
                          return <div key={tx}>-</div>
                        }
                        return (
                          <Tooltip
                            placement="top"
                            title={findPL?.text}
                            key={tx}
                          >
                            {findPL.icon()}
                          </Tooltip>
                        )
                      })}
                  </div>
                )
              }}
            />
          )
        }
        if (col.dataIndex === 'strengths') {
          return (
            <Column
              {...col}
              key={cx}
              render={(value, record) =>
                value ? (
                  <Button
                    type="link"
                    onClick={() =>
                      router.push({
                        pathname: `/workspace/${router.query?.slug}/2-stakeholder-consultation/initiatives`,
                        query: {
                          id: record?.id,
                        },
                      })
                    }
                  >
                    {`${value} Initiatives`}
                  </Button>
                ) : (
                  '-'
                )
              }
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
