import React, { useState } from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useRouter } from 'next/router'
export const useResourceTypes = () => {
  const { i18n } = useLingui()
  const resourceTypes = [
    {
      key: 'technical-resource',
      label: i18n._(t`Technical Resources`),
      title: 'technical_resource',
    },
    { key: 'event', label: i18n._(t`Events`), title: 'event' },
    { key: 'technology', label: i18n._(t`Technologies`), title: 'technology' },
    {
      key: 'capacity-building',
      label: i18n._(t`Capacity Development`),
      title: 'capacity building',
    },
    { key: 'initiative', label: i18n._(t`Initiatives`), title: 'initiative' },
    {
      key: 'action-plan',
      label: i18n._(t`Action Plans`),
      title: 'action_plan',
    },
    { key: 'policy', label: i18n._(t`Policies`), title: 'policy' },
    {
      key: 'financing-resource',
      label: i18n._(t`Financing Resources`),
      title: 'financing_resource',
    },
  ]
  return resourceTypes
}

const FilterBar = () => {
  const resourceTypes = useResourceTypes()
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()
  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey)
    router.push(`/knowledge/library/${tabKey}`)
  }
  return (
    <div className="filter-bar">
      <div className="overview">
        <ul className="categories">
          <div className="filter-bar">
            <div className="nav-bar">
              {resourceTypes.map((type) => (
                <div
                  key={type.key}
                  className={`nav-item ${
                    activeTab === type.key ? 'active' : ''
                  }`}
                  onClick={() => handleTabClick(type.key)}
                >
                  {type.label}
                </div>
              ))}
            </div>
          </div>
        </ul>
      </div>
    </div>
  )
}

export default FilterBar
