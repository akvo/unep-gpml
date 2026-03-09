import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '../../components/map-and-layers/sidebar'
import CountryOverview from './CountryOverview'
import DashboardLanding from './DashboardLanding'
import MobileTOC from './MobileTOC'
import useCountryData from '../../hooks/useCountryData'
import useActiveSection from '../../hooks/useActiveSection'
import { EXCEL_COUNTRY_CODES, SECTION_REGISTRY, STRAPI_SECTION_KEYS } from './constants'
import styles from './style.module.scss'

function ResourceView() {
  const router = useRouter()
  const { query } = router
  const { country, countryCode } = query

  const isExcelCountry = EXCEL_COUNTRY_CODES.includes(countryCode)
  const { data: countryFileData, loading: countryDataLoading } = useCountryData()

  // Compute which sections are available
  const availableSections = useMemo(() => {
    if (isExcelCountry) {
      // Excel countries: filter by JSON text content
      if (!countryFileData?.text) return SECTION_REGISTRY
      const textContent = countryFileData.text
      return SECTION_REGISTRY.filter((s) => {
        const section = textContent[s.textKey]
        if (!section || typeof section !== 'object') return false
        const keys = Object.keys(section).filter((k) => k !== 'title')
        return keys.length > 0
      })
    }
    // Non-Excel countries: show sections that have Strapi category mappings
    return SECTION_REGISTRY.filter((s) => STRAPI_SECTION_KEYS.has(s.key))
  }, [isExcelCountry, countryFileData])

  const sectionKeys = useMemo(
    () => availableSections.map((s) => s.key),
    [availableSections]
  )

  const { activeSection, scrollToSection, registerRef } =
    useActiveSection(sectionKeys)

  // Backward compat: if categoryId is in URL, scroll to mapped section then clean URL
  useEffect(() => {
    if (!query.categoryId) return

    const categoryToSection = {
      'industry-and-trade': 'trade',
      'waste-management': 'waste-management',
      'environmental-impact': 'environment',
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
  }, [query.categoryId])

  const showDashboard = !!country

  return (
    <>
      {showDashboard ? (
        <div className={styles.resource}>
          <Sidebar
            alt={false}
            countryDashboard={true}
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
