import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Button,
  Table,
  Tooltip,
  Typography,
  Select,
  Divider,
  message,
} from 'antd'
import classNames from 'classnames'
import { kebabCase, uniqBy, snakeCase } from 'lodash'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Trans, t } from '@lingui/macro'

import { PageLayout } from '..'
import {
  BookmarkIconProper,
  DesignNProdIcon,
  DistributionIcon,
  EndOfLifeIcon,
  PetroExtractionIcon,
  ConsumptionIcon,
  SearchIcon,
} from '../../../../components/icons'
import ModalAddEntity from '../../../../modules/flexible-forms/entity-modal/add-entity-modal'
import styles from './stakeholder-map.module.scss'
import api from '../../../../utils/api'
import { PlusOutlined } from '@ant-design/icons'
import { UIStore } from '../../../../store'
import { shortenOrgTypes } from '../../../../utils/misc'
import { loadCatalog } from '../../../../translations/utils'

const { Column } = Table
const { Text } = Typography

const PAGE_SIZE = 10
const PREFIX_TAG = 'stakeholder'
const SECTION_KEY = 'stakeholder-map'
const FILTER_FIELDS = {
  name: 'name',
  type: 'types',
  geo_coverage_type: 'geo_coverage_types',
}

export const PLASTIC_LIFECYCLE = [
  {
    text: t`Petrochemical Extraction`,
    value: 'petrochemical extraction',
    icon: PetroExtractionIcon,
  },
  {
    text: t`Design & Production`,
    value: 'design & production',
    icon: DesignNProdIcon,
  },
  {
    text: t`Distribution`,
    value: 'distribution',
    icon: DistributionIcon,
  },
  {
    text: t`Consumption`,
    value: 'consumption',
    icon: ConsumptionIcon,
  },
  {
    text: t`End of Life`,
    value: 'end-of-life',
    icon: EndOfLifeIcon,
  },
]

const StakeholderMapTable = ({
  psItem,
  entities,
  setEntities,
  preload,
  setPreload,
}) => {
  const [loading, setLoading] = useState(false)
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
        dataIndex: 'plasticStrategyBookmarks',
      },
      {
        title: t`Organisation`,
        dataIndex: 'name',
        filters: filterNames || [],
        sorter: true,
        sortDirections: ['ascend'],
      },
      {
        title: t`Type`,
        dataIndex: 'type',
        filters: filterTypes || [],
        sorter: true,
      },
      {
        title: t`Geo-coverage`,
        dataIndex: 'geoCoverageType',
        filters: filterGeo || [],
        sorter: true,
      },
      {
        title: t`Lifecycle Stage`,
        dataIndex: 'tags',
        filters: PLASTIC_LIFECYCLE,
      },
      {
        title: t`Focal Point`,
        dataIndex: 'focalPoints',
      },
      {
        title: t`Strengths`,
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

  const handleToggleBookmark = async (record, isMarked = false) => {
    const payload = {
      bookmark: !isMarked,
      entity_id: record?.id,
      entity_type: 'organisation',
      section_key: SECTION_KEY,
    }
    const _entities = entities.map((d) => {
      if (d?.id === record?.id) {
        const plasticStrategyBookmarks = payload.bookmark
          ? [
              {
                plasticStrategyId: psItem?.id,
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
    setEntities(_entities)
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
      const _entities = entities.map((e) => (e?.id === record?.id ? record : e))
      setEntities(_entities)
    }
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
    if (psItem && preload) {
      setPreload(false)
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
        ps_country_iso_code_a2: psItem?.country?.isoCodeA2,
        ps_bookmark_sections_keys: SECTION_KEY,
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
      const _entities = results.map((r) => ({
        ...r,
      }))
      setEntities(_entities)

      if (tableParams?.pagination?.total === undefined) {
        setTableParams({
          ...tableParams,
          pagination: {
            current: 1,
            pageSize: PAGE_SIZE,
            total: counts,
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
    preload,
  ])

  useEffect(() => {
    getStakeholderMapApi()
  }, [getStakeholderMapApi])

  useEffect(() => {
    if (entities.length && !tableFilters.length) {
      const filterNames = uniqBy(entities, 'name').map((d) =>
        mapFilter(d, 'name')
      )
      const filterTypes = uniqBy(entities, 'type').map((d) =>
        mapFilter(d, 'type')
      )
      const filterGeo = uniqBy(entities, 'geoCoverageType').map((d) =>
        mapFilter(d, 'geoCoverageType')
      )
      setTableFilters([filterNames, filterTypes, filterGeo])
    }
  }, [entities, tableFilters])

  return (
    <Table
      loading={loading}
      dataSource={entities}
      rowKey={(record) => record.key}
      pagination={paginationProps}
      onChange={handleTableChange}
    >
      {columns.map((col, cx) => {
        if (col.dataIndex === 'plasticStrategyBookmarks') {
          return (
            <Column
              {...col}
              key={cx}
              render={(bookmarks, record) => {
                const findBm = bookmarks?.find(
                  (b) => b?.plasticStrategyId === psItem?.id
                )
                const isMarked = findBm ? true : false
                return (
                  <Tooltip
                    title={
                      isMarked ? t`Remove from Library` : t`Save to Library`
                    }
                  >
                    <Button
                      type="link"
                      className={classNames({ bookmarked: isMarked })}
                      onClick={() => handleToggleBookmark(record, isMarked)}
                    >
                      <BookmarkIconProper />
                    </Button>
                  </Tooltip>
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
                      <Link key={vx} href={`/stakeholder/${v.id}`}>
                        <Tooltip title={`${v?.firstName} ${v?.lastName}`}>
                          <Avatar size={37}>
                            {v?.firstName?.[0]}
                            {v?.lastName?.[0]}
                          </Avatar>
                        </Tooltip>
                      </Link>
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
                          return null
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
                  <Link
                    href={`/workspace/${router.query?.slug}/2-stakeholder-consultation/initiatives?org=${record?.id}`}
                    className="ant-btn ant-btn-link"
                  >
                    {t`${value} Initiatives`}
                  </Link>
                ) : (
                  '-'
                )
              }
            />
          )
        }
        if (col.dataIndex === 'type') {
          return (
            <Column
              {...col}
              key={cx}
              render={(orgType) => {
                return <>{shortenOrgTypes?.[orgType] || orgType}</>
              }}
            />
          )
        }
        if (col.dataIndex === 'name') {
          return (
            <Column
              {...col}
              key={cx}
              render={(name, it) => {
                return (
                  <Link href={`/organisation/${it.id}`} target="_blank">
                    {name}
                  </Link>
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

const StakeholderMapForm = ({ entities, preload, setPreload }) => {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const [data, setData] = useState([])
  const [entity, setEntity] = useState([])
  const country = router.query.slug?.replace('plastic-strategy-', '')

  const storeData = UIStore.useState((s) => ({
    organisations: s.organisations,
    nonMemberOrganisations: s.nonMemberOrganisations,
  }))

  const { organisations, nonMemberOrganisations } = storeData

  useEffect(() => {
    setData([...organisations, ...nonMemberOrganisations])
  }, [organisations, nonMemberOrganisations])

  const setOrg = (res) => {
    setEntity(res.id)
    setData([...data, { id: res.id, name: res.name }])
  }

  const handleSelectToAdd = async (dataID) => {
    const isExist = entities.find((e) => e?.id === dataID)
    if (isExist) {
      message.warning('The entity is already added')
      return
    }
    try {
      await api.put(`/organisation/${dataID}`, {
        tags: [
          {
            tag: `${PREFIX_TAG}-${country}`,
            tag_category: 'general',
          },
        ],
      })
      /**
       * Reload the table to retrieve the newly added entity,
       * This cannot be handled with setEntities
       * because the selected entity only contains ID and name (has minimum info to shows on the table).
       */
      setPreload(true)
      setEntity([])
    } catch (error) {
      console.error('Unable to add entity', error)
      message.error('Unable to add entity')
    }
  }

  return (
    <>
      <h5 className={styles.title}>
        <Trans>Can't find who you're looking for?</Trans>
      </h5>
      <Select
        size="small"
        placeholder={t`Start typing...`}
        allowClear
        showSearch
        name="orgName"
        virtual={false}
        showArrow
        loading={preload}
        onChange={(value) => {
          setEntity(value)
        }}
        onSelect={(dataID) => handleSelectToAdd(dataID)}
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
        value={entity ? entity : undefined}
        className={`ant-select-suffix`}
        suffixIcon={<SearchIcon />}
        dropdownRender={(menu) => (
          <div className={styles.organisationDropdown}>
            {menu}
            <>
              <Divider style={{ margin: '4px 0' }} />
              <div className="add-button-container">
                <a onClick={() => setShowModal(!showModal)} className="h-xs">
                  <PlusOutlined /> Add a New Organisation
                </a>
              </div>
            </>
          </div>
        )}
      >
        {data?.map((item) => (
          <Select.Option value={item.id} key={item.id}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
      <ModalAddEntity
        visible={showModal}
        close={() => setShowModal(!showModal)}
        setEntity={setOrg}
        tag={`${PREFIX_TAG}-${country}`}
      />
    </>
  )
}

const View = ({ psItem }) => {
  const [entities, setEntities] = useState([])
  const [preload, setPreload] = useState(true)
  return (
    <div className={styles.stakeholderMapView}>
      <div className="title-section">
        <h4 className="caps-heading-m">
          <Trans>stakeholder consultation process</Trans>
        </h4>
        <h2 className="h-xxl w-bold">
          <Trans>Stakeholder Map</Trans>
        </h2>
      </div>
      <div className="desc-section">
        <p>
          <Trans>Find and connect the stakeholders relevant to you</Trans>
        </p>
      </div>
      <div className="table-section">
        <StakeholderMapTable
          psItem={psItem}
          {...{ entities, setEntities, preload, setPreload }}
        />
      </div>
      <div className="add-section">
        <StakeholderMapForm {...{ entities, preload, setPreload }} />
      </div>
    </div>
  )
}

View.getLayout = PageLayout

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default View
