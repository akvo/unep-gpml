import React, { Fragment } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '../../components/map-and-layers/sidebar'
import CountryOverview from '../../pages/countryOverview'
import DashboardLanding from '../../pages/countryOverview/IntroPage'
import styles from './style.module.scss'
function ResourceView() {
  const router = useRouter()
  const { query } = router
  const { country } = query

  return (
    <>
      {country && router.query.categoryId ? (
        <div className={styles.resource}>
          <Sidebar alt={false} countryDashboard={true} />

          <CountryOverview country={country} />
        </div>
      ) : (
        <div className={styles.resourceLand}>
        <DashboardLanding />
        </div>
      )}
    </>
  )
}

export default ResourceView
