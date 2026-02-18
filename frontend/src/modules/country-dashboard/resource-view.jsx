import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '../../components/map-and-layers/sidebar'
import CountryOverview from './CountryOverview'
import DashboardLanding from './DashboardLanding'
import MobileTOC from './MobileTOC'
import useCountryData from '../../hooks/useCountryData'
import useActiveSection from '../../hooks/useActiveSection'
import { EXCEL_COUNTRY_CODES, SECTION_REGISTRY } from './constants'
import styles from './style.module.scss'

function ResourceView() {
  const router = useRouter()
  const { query } = router
  const { country, countryCode } = query

  const isExcelCountry = EXCEL_COUNTRY_CODES.includes(countryCode)
  const { data: countryFileData, loading: countryDataLoading } = useCountryData()

  // Compute which sections have data in the JSON
  const availableSections = useMemo(() => {
    if (!isExcelCountry || !countryFileData?.text) return SECTION_REGISTRY
    const textContent = countryFileData.text
    return SECTION_REGISTRY.filter((s) => textContent[s.textKey])
  }, [isExcelCountry, countryFileData])

  const sectionKeys = useMemo(
    () => availableSections.map((s) => s.key),
    [availableSections]
  )

  const { activeSection, scrollToSection, registerRef } =
    useActiveSection(sectionKeys)

  // Backward compat: if categoryId is in URL for Excel country, scroll to that section then clean URL
  useEffect(() => {
    if (!isExcelCountry || !query.categoryId) return

    const categoryToSection = {
      production: 'production',
      trade: 'trade',
      consumption: 'consumption',
      'waste-management-xl': 'waste-management',
      environment: 'environment',
      'life-cycle-insights': 'life-cycle-insights',
    }
    const targetSection = categoryToSection[query.categoryId]
    if (targetSection) {
      setTimeout(() => scrollToSection(targetSection), 300)
    }

    const { categoryId, ...rest } = query
    router.replace({ pathname: router.pathname, query: rest }, undefined, {
      shallow: true,
    })
  }, [isExcelCountry, query.categoryId])

  const showDashboard = isExcelCountry
    ? !!country
    : !!country && !!query.categoryId

  return (
    <>
      {showDashboard ? (
        <div className={styles.resource}>
          <Sidebar
            alt={false}
            countryDashboard={true}
            isExcelCountry={isExcelCountry}
            availableSections={availableSections}
            activeSection={activeSection}
            scrollToSection={scrollToSection}
          />
          <MobileTOC
            availableSections={availableSections}
            activeSection={activeSection}
            scrollToSection={scrollToSection}
          />
          <CountryOverview
            country={country}
            countryFileData={countryFileData}
            countryDataLoading={countryDataLoading}
            availableSections={availableSections}
            registerRef={registerRef}
          />
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
