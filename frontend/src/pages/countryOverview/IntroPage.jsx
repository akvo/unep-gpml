import React, { useState, useEffect } from 'react'
import { Layout, Button, Select } from 'antd'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import { getBaseUrl } from '../../utils/misc'

const { Content } = Layout

const DashboardLanding = () => {
  const [countryOpts, setCountryOpts] = useState([])
  const [countries, setCountries] = useState([])
  const router = useRouter()
  const baseURL = getBaseUrl()

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          `${baseURL}/api/country`
        )
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
    const selectedCountry = countries.find((country) => country.id === value)

    if (selectedCountry) {
      router.push(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            country: selectedCountry.name,
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
          <span style={{ textDecoration: 'underline' }}>national data</span> for
          more transparency
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '40px' }}>
          The national data allows you to view key plastic statistics for your
          country in one place. It presents the latest available data covering
          key stages of the plastics and highlights indicators on plastic waste
          management, trade, governance, and environment.
        </p>

        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          Most data are sourced from quality assured global datasets, enabling
          the opportunity to compare the status of plastics management among
          countries.
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
          >
            Select
          </Button>
        </div>
      </Content>
    </Layout>
  )
}

export default DashboardLanding
