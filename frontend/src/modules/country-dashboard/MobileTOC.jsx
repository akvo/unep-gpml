import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Select } from 'antd'
import { useRouter } from 'next/router'
import { t } from '@lingui/macro'
import { UIStore } from '../../store'
import { EXCEL_COUNTRY_CODES } from './constants'
import styles from './CountryOverview.module.scss'

const DropdownSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="9"
    viewBox="0 0 14 9"
    fill="none"
  >
    <path d="M1 1L7 7L13 1" stroke="#020A5B" strokeWidth="2" />
  </svg>
)

const MobileTOC = ({ availableSections, activeSection, scrollToSection }) => {
  const router = useRouter()
  const { country, countryCode } = router.query
  const [collapsed, setCollapsed] = useState(false)
  const lastScrollY = useRef(0)

  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
  }))

  const countryOpts = useMemo(() => {
    if (!countries || countries.length === 0) return []
    return countries
      .filter((c) => c.description === 'Member State')
      .map((c) => ({ value: c.id, label: c.name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [countries])

  const selectedCountryId = useMemo(() => {
    if (!countries || !country) return undefined
    const found = countries.find((c) => c.name === country)
    return found?.id
  }, [countries, country])

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY > lastScrollY.current && currentY > 80) {
        setCollapsed(true)
      } else {
        setCollapsed(false)
      }
      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!availableSections || availableSections.length === 0) return null

  const countryName = country ? decodeURIComponent(country).toUpperCase() : ''

  const sectionOptions = availableSections.map((s) => ({
    value: s.key,
    label: s.title,
  }))

  const handleSectionChange = (key) => {
    scrollToSection(key)
  }

  const handleCountryChange = (val) => {
    const selected = countries.find((c) => c.id === val)
    if (!selected) return

    const isExcel = EXCEL_COUNTRY_CODES.includes(selected.isoCodeA3)
    const newQuery = {
      ...router.query,
      country: selected.name,
      countryCode: selected.isoCodeA3,
    }
    if (!isExcel) {
      newQuery.categoryId =
        router.query.categoryId || 'industry-and-trade'
    } else {
      delete newQuery.categoryId
    }
    router.push(
      { pathname: router.pathname, query: newQuery },
      undefined,
      { shallow: true }
    )
  }

  return (
    <div
      className={`${styles.mobileToc} ${
        collapsed ? styles.mobileTocCollapsed : ''
      }`}
    >
      <div
        className={`${styles.mobileTocHeader} ${
          collapsed ? styles.mobileTocHeaderHidden : ''
        }`}
      >
        <div className={styles.mobileTocLabel}>{t`National data`}</div>
        <Select
          showSearch
          size="large"
          value={selectedCountryId}
          placeholder={t`Search Country`}
          options={countryOpts}
          suffixIcon={<DropdownSvg />}
          filterOption={(input, option) =>
            option?.label?.toLowerCase().includes(input.toLowerCase())
          }
          onChange={handleCountryChange}
          className={styles.mobileTocCountrySelect}
        />
      </div>
      {collapsed && countryName && (
        <div className={styles.mobileTocCountryName}>{countryName}</div>
      )}
      <Select
        value={activeSection}
        options={sectionOptions}
        onChange={handleSectionChange}
        suffixIcon={<DropdownSvg />}
        className={styles.mobileTocSelect}
        popupMatchSelectWidth={true}
      />
    </div>
  )
}

export default MobileTOC
