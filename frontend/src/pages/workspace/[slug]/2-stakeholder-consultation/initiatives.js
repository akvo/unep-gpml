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
import { Trans, t } from '@lingui/macro'

const sectionKey = 'stakeholder-initiatives'

const View = ({ setLoginVisible, isAuthenticated }) => {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({})

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

  const filterEntity = ({ entityConnections }, filter) =>
    entityConnections?.filter((ec) => {
      if (filter?.stakeholder && filter?.representativeGroup) {
        return (
          filter.stakeholder === ec.entityId &&
          filter.representativeGroup === ec.representativeGroup
        )
      }
      if (filter?.stakeholder && !filter?.representativeGroup) {
        return filter.stakeholder === ec.entityId
      }
      if (!filter?.stakeholder && filter?.representativeGroup) {
        return filter.representativeGroup === ec.representativeGroup
      }
      return ec
    }).length > 0

  const filteredItems = useMemo(() => {
    if (Object.keys(filter).length) {
      /**
       * Applying sequence filtering with all active filters.
       */
      return items
        .filter((i) => {
          // By initiative type
          if (filter?.subContentType) {
            return i?.subContentType === filter.subContentType
          }
          return i
        })
        .filter((i) => {
          // By geo-coverage
          if (filter?.geoCoverageType) {
            return i?.geoCoverageType === filter.geoCoverageType
          }
          return i
        })
        .filter((i) => {
          // By stakeholder or reprensentative group
          if (filter?.stakeholder || filter?.representativeGroup) {
            return filterEntity(i, filter)
          }
          return i
        })
    }
    return items
  }, [items, filter])

  const handleSelectOption = (name, value) => {
    setFilter({ ...filter, [name]: value })
  }

  useEffect(() => {
    const { slug, org: entityID } = router.query
    const country = slug?.replace('plastic-strategy-', '')
    const countryCode = isoA2[country]
    const countryId = iso2id[countryCode]
    if (countryId != null) {
      let params = { topic: 'initiative', ps_country_iso_code_a2: countryCode }
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
  }, [router])

  return (
    <div className={styles.initiativesView}>
      <h4 className="caps-heading-m">
        <Trans>Stakeholder Consultation Process</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Initiatives</Trans>
      </h2>
      <p>
        <Trans>Description - Section 2 - Initatives</Trans>
      </p>
      <div className="filter-container">
        <Select
          allowClear
          showArrow
          dropdownMatchSelectWidth={false}
          size="large"
          placeholder="Initiative type"
          onChange={(values) => {
            handleSelectOption('subContentType', values)
          }}
          options={[{ label: 'Any', value: null }, ...ops1]}
        />
        <Select
          allowClear
          showArrow
          dropdownMatchSelectWidth={false}
          size="large"
          placeholder="Representative group"
          onChange={(values) => {
            handleSelectOption('representativeGroup', values)
          }}
          options={[
            { label: 'Any', value: null },
            ...ops2,
            { label: 'Other', value: 'Other' },
          ]}
        />
        <Select
          allowClear
          showArrow
          dropdownMatchSelectWidth={false}
          size="large"
          placeholder="Geo-coverage"
          onChange={(values) => {
            handleSelectOption('geoCoverageType', values)
          }}
          options={[{ label: 'Any', value: null }, ...ops3]}
        />
        <Select
          allowClear
          showArrow
          dropdownMatchSelectWidth={false}
          size="large"
          placeholder="Stakeholder"
          onChange={(values) => {
            handleSelectOption('stakeholder', values)
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
