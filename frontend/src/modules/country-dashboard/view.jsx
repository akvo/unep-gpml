import React, { Fragment } from 'react'
import ResourceView from './resource-view'
import styles from './style.module.scss'

function CountryLibrary({}) {
  return (
    <div className={styles.knowledgeLib} style={{ backgroundColor: '#F5F7FF' }}>
      <Fragment>
        <ResourceView />
      </Fragment>
    </div>
  )
}
export default CountryLibrary
