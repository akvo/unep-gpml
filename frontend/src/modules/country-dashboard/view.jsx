import React, { Fragment } from 'react'
import ResourceView from './resource-view'
import styles from './style.module.scss'
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

function CountryLibrary({}) {
  const router = useRouter()
  return (
    <div className={styles.knowledgeLib} style={{ backgroundColor: '#F5F7FF' }}>
      <Fragment>
        <ResourceView />
      </Fragment>
    </div>
  )
}
export default CountryLibrary
