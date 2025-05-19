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
      <div className={styles.resource}>
        {country && router.query.categoryId && (
          <Sidebar alt={false} countryDashboard={true} />
        )}

        {country && router.query.categoryId ? (
          <CountryOverview country={country} />
        ) : (
          <DashboardLanding />
        )}
      </div>
  )
}

export default ResourceView
