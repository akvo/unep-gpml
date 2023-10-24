import { useEffect, useMemo, useState } from 'react'
import { Button, Dropdown, Menu } from 'antd'
import { useRouter } from 'next/router'
import { PageLayout } from '..'
import api from '../../../../utils/api'
import ResourceCards from '../../../../modules/workspace/ps/resource-cards'
import { iso2id, isoA2 } from '../../../../modules/workspace/ps/config'
import { DropDownIcon } from '../../../../components/icons'
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
  const stakeholderSuggestedTags = UIStore.useState(
    (s) => s.stakeholderSuggestedTags
  )

  const filterDropdowns = useMemo(() => {
    const ops1 = initiativeTypes?.map((i) => ({
      text: i.title,
      value: i.title,
    }))
    const ops2 = representativeGroup.map((r) => ({
      text: r.name,
      value: r.name,
    }))
    const ops3 = geoCoverageTypeOptions.map((geoType) => ({
      text: geoType,
      value: geoType?.toLowerCase(),
    }))
    const ops4 = stakeholderSuggestedTags.map((tag) => ({
      text: tag,
      value: tag?.toLowerCase(),
    }))
    return [
      {
        label: 'Initiative type',
        name: 'subContentType',
        items: ops1,
        isBE: true,
      },
      {
        label: 'Representative group',
        name: 'representativeGroup',
        items: ops2,
        isBE: true,
      },
      {
        label: 'Geo-coverage',
        name: 'geoCoverageType',
        items: ops3,
        isBE: false,
      },
      {
        label: 'Stakeholder',
        name: 'tag',
        items: ops4,
        isBE: true,
      },
    ]
  }, [
    initiativeTypes,
    representativeGroup,
    geoCoverageTypeOptions,
    stakeholderSuggestedTags,
  ])

  const filteredItems = useMemo(() => {
    if (filter?.geoCoverageType) {
      return items.filter((i) => {
        return i.geoCoverageType === filter.geoCoverageType
      })
    }
    return items
  }, [items, filter])

  const handleSelectOption = ({ isBE, name }, value) => {
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
      api.get(`/browse`, params).then((d) => {
        setItems(d.data?.results)
        setLoading(false)
        console.log(d.data)
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
        {filterDropdowns.map((dropdown, dx) => {
          const defltText = queryParam?.[dropdown.name] || dropdown.label
          const labelText =
            dropdown.name === 'geoCoverageType'
              ? filter?.geoCoverageType || defltText
              : defltText
          return (
            <Dropdown
              overlay={
                <Menu className="filter-dropdown">
                  <Menu.Item onClick={() => handleSelectOption(dropdown, null)}>
                    All
                  </Menu.Item>
                  {dropdown.items.map((item, index) => (
                    <Menu.Item
                      key={index}
                      onClick={() => handleSelectOption(dropdown, item?.value)}
                    >
                      {item?.text}
                    </Menu.Item>
                  ))}
                </Menu>
              }
              trigger={['click']}
              key={dx}
            >
              <Button size="small" ghost>
                {labelText}
                <DropDownIcon />
              </Button>
            </Dropdown>
          )
        })}
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
