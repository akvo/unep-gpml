import React, { Fragment, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '../../components/map-and-layers/sidebar'
import CountryOverview from '../../pages/countryOverview'
import DashboardLanding from '../../pages/countryOverview/IntroPage'

function ResourceView() {
  const router = useRouter()
  const { isReady, query } = router
  const { country } = query

  const [loading, setLoading] = useState(true)

  useMemo(() => {
    if (isReady && !loading) {
      updateQuery('replace')
    }
  }, [isReady, query])

  return (
    <Fragment>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          maxHeight: '1000px',
          width: '100%',
          overflow: 'auto',
          paddingTop: '50px',
        }}
      >
        <Sidebar alt={false} countryDashboard={true} />

        {country && router.query.categoryId ? (
          <CountryOverview country={country} />
        ) : (
          <DashboardLanding />
        )}
      </div>
    </Fragment>
  )
}

export default ResourceView
