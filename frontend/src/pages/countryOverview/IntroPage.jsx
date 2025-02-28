import React, { useState, useEffect } from 'react'
import { Layout, Button, Select } from 'antd'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import { getBaseUrl } from '../../utils/misc'
import { loadCatalog } from '../../translations/utils'
import { t, Trans } from '@lingui/macro'

const { Content } = Layout

const DashboardLanding = () => {
  const [countryOpts, setCountryOpts] = useState([])
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [windowWidth, setWindowWidth] = useState(1200)
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
        console.error(`Error fetching countries :`, error)
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth)

      const handleResize = () => {
        setWindowWidth(window.innerWidth)
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleCountryChange = (value) => {
    setSelectedCountry(value)
  }

  const handleSelect = () => {
    const country = countries.find((country) => country.id === selectedCountry)

    if (country) {
      router.push(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            country: country.name,
            countryCode: country.iso_code_a3,
            categoryId: router.query.categoryId || 'industry-and-trade',
          },
        },
        undefined,
        { shallow: true }
      )
    }
  }

  return (
    <Layout style={{ height: isMobile ? '100%' : '100vh', width: 'auto' }}>
      <Content
        style={{
          padding: windowWidth < 768 ? '20px 20px' : '60px 40px',
          background: '#0A1F44',
          color: '#fff',
        }}
      >
        <h1
          style={{
            fontSize: windowWidth < 768 ? '20px' : '48px',
            lineHeight: '56px',
            marginBottom: windowWidth < 768 ? '12px' : '24px',
            color: '#FFFFFF',
          }}
        >
          <Trans>Explore </Trans>
          <span style={{ textDecoration: 'underline' }}>
            {' '}
            <Trans> Country Dashboard</Trans>
          </span>
        </h1>

        <p
          style={{
            fontSize: windowWidth < 768 ? '14px' : '18px',
            marginBottom: windowWidth < 768 ? '10px' : '20px',
          }}
        >
          <Trans>
            The GPML Country Dashboard provides a comprehensive snapshot of
            plastic flows in both the economy and the environment for each
            country. It consolidates data from best available global datasets
            into one accessible platform, aiming to support evidence-based
            policymaking and action planning. Additionally, it helps identify
            data gaps that require further collection efforts in specific
            countries.
          </Trans>
        </p>

        <p
          style={{
            fontSize: windowWidth < 768 ? '14px' : '18px',
            marginBottom: '20px',
          }}
        >
          <Trans>
            {' '}
            The data featured on the Country Dashboard comes from reliable
            sources, including country reports on the Sustainable Development
            Goals, as well as modeled global estimates from UN agencies,
            academic institutions, and recognized research organizations. All
            data sources are clearly indicated, including links to the original
            methodologies and any information regarding uncertainties related to
            the modeling outputs.{' '}
          </Trans>
        </p>

        <p
          style={{
            fontSize: windowWidth < 768 ? '14px' : '18px',
            fontStyle: 'italic',
            marginBottom: '20px',
          }}
        >
          <Trans>
            * You are currently viewing the beta version of the Country
            Dashboard, and we welcome your feedback on its usability and
            content. We particularly welcome suggestions for updated and
            improved data sources for your country. To request a data update,
            please use the "Request Data Update" button within your Country
            Dashboard section.
          </Trans>
        </p>

        <div
          style={{ display: 'flex', alignItems: 'center', marginTop: '40px' }}
        >
          <Select
            placeholder={t`Select the country`}
            size="large"
            value={router.query.country}
            showSearch
            options={countryOpts}
            style={{
              width: '300px',
              marginRight: '20px',
              borderRadius: '8px',
            }}
            filterOption={(input, option) =>
              option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={handleCountryChange}
          />
          <Button
            type="primary"
            size="large"
            style={{
              backgroundColor: '#00C49A',
              borderRadius: '30px',
              width: '150px',
              height: '4vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={handleSelect}
            disabled={!selectedCountry}
          >
            <Trans>Select</Trans>
          </Button>
        </div>
      </Content>
    </Layout>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default DashboardLanding
