import React, { useState, useEffect, useRef } from 'react'
import { Select } from 'antd'
import { useRouter } from 'next/router'
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
  const { country } = router.query
  const [collapsed, setCollapsed] = useState(false)
  const lastScrollY = useRef(0)

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

  const countryName = country ? decodeURIComponent(country) : ''

  const options = availableSections.map((s) => ({
    value: s.key,
    label: s.title,
  }))

  const handleChange = (key) => {
    scrollToSection(key)
  }

  return (
    <div
      className={`${styles.mobileToc} ${
        collapsed ? styles.mobileTocCollapsed : ''
      }`}
    >
      <div
        className={`${styles.mobileTocCountry} ${
          collapsed ? styles.mobileTocCountryHidden : ''
        }`}
      >
        {countryName}
      </div>
      <Select
        value={activeSection}
        options={options}
        onChange={handleChange}
        suffixIcon={<DropdownSvg />}
        className={styles.mobileTocSelect}
        popupMatchSelectWidth={true}
      />
    </div>
  )
}

export default MobileTOC
