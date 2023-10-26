import { useEffect, useMemo, useState } from 'react'
import { Select } from 'antd'
import { useRouter } from 'next/router'
import uniqBy from 'lodash/uniqBy'
import { PageLayout } from '..'
import api from '../../../../utils/api'
import ResourceCards from '../../../../modules/workspace/ps/resource-cards'
import { iso2id, isoA2 } from '../../../../modules/workspace/ps/config'
import styles from './initiatives.module.scss'
import { UIStore } from '../../../../store'

const sectionKey = 'stakeholder-initiatives'

const View = ({ setLoginVisible, isAuthenticated }) => {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({})
  const [queryParam, setQueryParam] = useState({
    topic: 'initiative',
  })

  const mainContentType = UIStore.useState((s) => s.mainContentType)
  const { childs: initiativeTypes } = mainContentType.find(
    (m) => m.code === 'initiative'
  )
  const representativeGroup = UIStore.useState((s) => s.representativeGroup)
  const geoCoverageTypeOptions = UIStore.useState(
    (s) => s.geoCoverageTypeOptions
  )
  /**
   * Get dropdown options from UIStore
   */
  const ops1 = initiativeTypes?.map((i) => ({
    label: i.title,
    value: i.title,
  }))
  const ops2 = representativeGroup.map((r) => ({
    label: r.name,
    value: r.name,
  }))
  const ops3 = geoCoverageTypeOptions.map((geoType) => ({
    label: geoType,
    value: geoType?.toLowerCase(),
  }))
  /**
   * Collect all entity connections as options
   */
  const stakeholders = items
    ?.flatMap((i) => i?.entityConnections)
    ?.map((s) => ({
      label: s?.name,
      value: s?.entityId,
    }))
  const ops4 = uniqBy(stakeholders, 'value')

  const filterSk = ({ entityConnections }, filter) =>
    entityConnections?.filter((sc) => filter?.stakeholder === sc.entityId)
      .length > 0

  const filteredItems = useMemo(() => {
    if (Object.keys(filter).length) {
      return items.filter((i) => {
        if (filter?.geoCoverageType?.length && filter?.stakeholder) {
          return (
            filter.geoCoverageType.includes(i.geoCoverageType) &&
            filterSk(i, filter)
          )
        }
        if (filter?.geoCoverageType?.length && !filter?.stakeholder) {
          return filter.geoCoverageType.includes(i.geoCoverageType)
        }
        if (!filter?.geoCoverageType?.length && filter?.stakeholder) {
          return filterSk(i, filter)
        }
        return i
      })
    }
    return items
  }, [items, filter])

  const handleSelectOption = (name, isBE, value) => {
    if (isBE) {
      setQueryParam({
        ...queryParam,
        [name]: value,
      })
    } else {
      setFilter({ ...filter, [name]: value })
    }
  }

  useEffect(() => {
    const { slug, org: entityID } = router.query
    const country = slug?.replace('plastic-strategy-', '')
    const countryCode = isoA2[country]
    const countryId = iso2id[countryCode]
    if (countryId != null) {
      let params = { ...queryParam, ps_country_iso_code_a2: countryCode }
      params = entityID
        ? {
            ...params,
            entity: entityID,
          }
        : {
            ...params,
            country: countryId,
          }
      api.get(`/browse?inc_entity_connections=true`, params).then((d) => {
        setItems(d.data?.results)
        setLoading(false)
      })
    }
  }, [router, queryParam])

  return (
    <div className={styles.initiativesView}>
      <h4 className="caps-heading-m">Stakeholder Consultation Process</h4>
      <h2 className="h-xxl w-bold">Initiatives</h2>
      <p>
        Find country initiatives across a wide variety of subjects and sectors
        currently ongoing. Filter either directly on the map or using the
        sidebar navigation to easily find relevant initatives.{' '}
      </p>
      <div className="filter-container">
        <Select
          allowClear
          showArrow
          size="large"
          placeholder="Initiative type"
          onChange={(values) => {
            handleSelectOption('subContentType', true, values)
          }}
          options={[{ label: 'Any', value: null }, ...ops1]}
        />
        <Select
          allowClear
          showArrow
          size="large"
          placeholder="Representative group"
          onChange={(values) => {
            handleSelectOption('representativeGroup', true, values)
          }}
          options={[{ label: 'Any', value: null }, ...ops2]}
        />
        <Select
          allowClear
          showArrow
          size="large"
          placeholder="Geo-coverage"
          onChange={(values) => {
            handleSelectOption('geoCoverageType', false, values)
          }}
          options={[{ label: 'Any', value: null }, ...ops3]}
        />
        <Select
          allowClear
          showArrow
          size="large"
          placeholder="Stakeholder"
          onChange={(values) => {
            handleSelectOption('stakeholder', false, values)
          }}
          options={ops4}
        />
      </div>
      <ResourceCards
        items={filteredItems}
        {...{
          setLoginVisible,
          isAuthenticated,
          loading,
          sectionKey,
        }}
      />
    </div>
  )
}

View.getLayout = PageLayout

export default View
