import React, { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '../../components/map-and-layers/sidebar'
import CountryOverview from '../../pages/countryOverview'
import DashboardLanding from '../../pages/countryOverview/IntroPage'

function ResourceView() {
  const router = useRouter()
  const { query } = router
  const { country } = query

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          backgroundColor: '#f8f9fa',
          boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <Sidebar
          alt={false}
          countryDashboard={true}
          alwaysOpen={true}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ width: '100%', maxWidth: '1200px', paddingTop: '20px' }}>
        {country && router.query.categoryId ? (
          <CountryOverview country={country} />
        ) : (
          <DashboardLanding />
        )}
      </div>
    </div>
  ) : (
    <Fragment>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          // maxHeight: '1000px',
          width: '100%',
          overflow: 'visible',
          paddingBottom: '70px',
        }}
      >
        {country && router.query.categoryId && (
          <Sidebar alt={false} countryDashboard={true} />
        )}

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
