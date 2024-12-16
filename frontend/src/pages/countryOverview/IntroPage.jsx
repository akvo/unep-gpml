import React, { useState, useEffect } from 'react'
import { Layout, Button, Select } from 'antd'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import { getBaseUrl } from '../../utils/misc'

const { Content } = Layout

const DashboardLanding = () => {
  const [countryOpts, setCountryOpts] = useState([])
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const router = useRouter()
  const baseURL = getBaseUrl()

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
    <Layout style={{ height: '100vh' }}>
      <Content
        style={{
          padding: '60px 40px',
          background: '#0A1F44',
          color: '#fff',
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            lineHeight: '56px',
            marginBottom: '24px',
            color: '#FFFFFF',
          }}
        >
          Explore{' '}
          <span style={{ textDecoration: 'underline' }}>Country Dashboard</span>
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '40px' }}>
          The GPML Country Dashboard provides a comprehensive snapshot of
          plastic flows in both the economy and the environment for each
          country. It consolidates data from best available global datasets into
          one accessible platform, aiming to support evidence-based policymaking
          and action planning. Additionally, it helps identify data gaps that
          require further collection efforts in specific countries.
        </p>

        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          The data featured on the Country Dashboard comes from reliable
          sources, including country reports on the Sustainable Development
          Goals, as well as modeled global estimates from UN agencies, academic
          institutions, and recognized research organizations. All data sources
          are clearly indicated, including links to the original methodologies
          and any information regarding uncertainties related to the modeling
          outputs.
        </p>

        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          You are currently viewing the beta version of the Country Dashboard,
          and we welcome your feedback on its usability and content. We
          particularly welcome suggestions for updated and improved data sources
          for your country. To request a data update, please use the "Request
          Data Update" button within your Country Dashboard section.
        </p>

        <div
          style={{ display: 'flex', alignItems: 'center', marginTop: '40px' }}
        >
          <Select
            placeholder="Search for a country..."
            size="large"
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
              width: '120px',
            }}
            onClick={handleSelect}
            disabled={!selectedCountry}
          >
            Select
          </Button>
        </div>
      </Content>
    </Layout>
  )
}

export default DashboardLanding
