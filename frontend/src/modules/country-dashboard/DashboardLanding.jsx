import React, { useState, useEffect } from 'react'
import { Layout, Select } from 'antd'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import { getBaseUrl } from '../../utils/misc'
import { t, Trans } from '@lingui/macro'
import { EXCEL_COUNTRY_CODES } from './constants'
import styles from './CountryOverview.module.scss'
const { Content } = Layout

const DashboardLanding = () => {
  const [countryOpts, setCountryOpts] = useState([])
  const [countries, setCountries] = useState([])
  const router = useRouter()
  const baseURL = getBaseUrl()

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${baseURL}/api/country`)
        const data = await response.json()
        setCountries(data)
      } catch (error) {
        console.error('Error fetching countries:', error)
      }
    }

    fetchCountries()
  }, [])

  useEffect(() => {
    if (!isEmpty(countries)) {
      const filteredCountries = countries
        .filter(
          (country) => country.description.toLowerCase() === 'member state'
        )
        .map((it) => ({ value: it.id, label: it.name }))
        .sort((a, b) => a.label.localeCompare(b.label))

      setCountryOpts(filteredCountries)
    }
  }, [countries])

  const handleCountryChange = (value) => {
    const country = countries.find((country) => country.id === value)

    if (country) {
      const isExcel = EXCEL_COUNTRY_CODES.includes(country.iso_code_a3)
      const newQuery = {
        ...router.query,
        country: country.name,
        countryCode: country.iso_code_a3,
      }
      // Excel countries use the one-pager (no categoryId needed)
      if (!isExcel) {
        newQuery.categoryId = router.query.categoryId || 'industry-and-trade'
      }
      router.push(
        { pathname: router.pathname, query: newQuery },
        undefined,
        { shallow: true }
      )
    }
  }

  return (
    <Layout
      style={{
        height: isMobile ? '100%' : '100vh',
        width: 'auto',
        background: '#F5F7FF',
      }}
    >
      <Content className={styles.contentAntLayout}>
        <div className={styles.headerLanding}>
          <Trans>Explore </Trans> <Trans> Country Dashboard</Trans>
        </div>
        <br />
        <Select
          placeholder={t`Select a Country to Get Started`}
          size="large"
          value={router.query.country}
          showSearch
          options={countryOpts}
          suffixIcon={<DropdownSvg />}
          filterOption={(input, option) =>
            option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onChange={handleCountryChange}
          className={styles.selectCountry}
        />
        <br />

        <p
          style={{
            fontSize: isMobile ? '14px' : '18px',
            marginBottom: isMobile ? '10px' : '20px',
          }}
        >
          <Trans>
            The Country Dashboard provides a comprehensive snapshot of plastic
            flows in both the economy and the environment for each country. It
            consolidates data from best available global datasets from
            peer-reviewed scientific studies and global monitoring initiatives
            by international organizations into one accessible platform, aiming
            to support evidence-based policymaking and action planning.
            Additionally, it helps identify data gaps that require further
            collection efforts in specific countries.
          </Trans>
        </p>

        <p
          style={{
            fontSize: isMobile ? '14px' : '18px',
            marginBottom: '20px',
          }}
        >
          <Trans>
            All data sources are clearly indicated, including links to the
            original methodologies and any information regarding uncertainties
            related to the modelling outputs.
          </Trans>
        </p>

        <p
          style={{
            fontSize: isMobile ? '14px' : '18px',
            fontStyle: 'italic',
            marginBottom: '20px',
            color: '#00000080',
          }}
        >
          <Trans>
            * You are currently viewing the beta version of the Country
            Dashboard, and we welcome your feedback on its usability and
            content. We particularly welcome suggestions for updated and
            improved data sources for your country. To request a data update,
            please use the "Submit Data Update" button within your Country
            Dashboard section.
          </Trans>
        </p>

      </Content>
    </Layout>
  )
}

export default DashboardLanding

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
