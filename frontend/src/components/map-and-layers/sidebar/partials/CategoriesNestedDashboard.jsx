import React, { useEffect, useState } from 'react'
import { Layout, Select, Button } from 'antd'
import useQueryParameters from '../../../../hooks/useQueryParameters'
import { UIStore } from '../../../../store'
import { isEmpty } from 'lodash'
import { getBaseUrl } from '../../../../utils/misc'

const { Sider } = Layout

const CategoriesNestedDashboard = ({ categories }) => {
  const { queryParameters, setQueryParameters } = useQueryParameters()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const baseURL = getBaseUrl()
  const [isMobile, setIsMobile] = useState(false)

  const { countries, transnationalOptions } = UIStore.useState((s) => ({
    countries: s.countries,
    transnationalOptions: s.transnationalOptions,
    landing: s.landing,
  }))

  const isLoaded = () => !isEmpty(countries)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const countryOpts = isLoaded()
    ? countries
        .filter((country) => country.description === 'Member State')
        .map((it) => ({ value: it.id, label: it.name }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : []

  const handleChangeCountry = (val) => {
    const selected = countries?.find((x) => x.id === val)

    const newParams = {
      country: selected?.name,
      countryCode: selected?.isoCodeA3,
    }

    setQueryParameters(newParams)

    setSelectedCountry(selectedCountry?.name)
  }

  const handleCategoryClick = (category) => {
    const newParams = {
      categoryId: category.attributes.categoryId,
    }

    setQueryParameters(newParams)
    setSelectedCategory(category.attributes.categoryId)
  }
  console.log('Trigger build')
  const isCategorySelected = (category) => {
    return queryParameters.categoryId === category.attributes.categoryId
  }

  const handleViewGlobalDataClick = () => {
    const categoryId = selectedCategory || queryParameters.categoryId
    if (categoryId) {
      window.open(`${baseURL}/data/maps?categoryId=${categoryId}`, '_blank')
    } else {
      alert('Please select a category before viewing global data.')
    }
  }

  const handleBackToHomePage = () => {
    window.history.back()
  }

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="100%"
      width={360}
      style={{
        height: '100%',
        padding: '0',
        margin: '0',
      }}
    >
      <div
        style={{
          position: isMobile ? 'sticky' : 'relative',
          marginLeft: '20px',
          marginTop: '10px',
          marginBottom: isMobile ? '5px' : '20px',
          fontSize: isMobile ? '15px' : '16px',
          fontWeight: 'bold',
          fontFamily: 'var(--font-archia), sans-serif',
          color: '#7468ff',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
        onClick={handleBackToHomePage}
      >
        <span style={{ fontSize: '14px' }}>←</span> NATIONAL DATA
      </div>
      <Select
        showSearch
        size="large"
        allowClear
        value={queryParameters.country ? queryParameters.country : ''}
        placeholder="Search Country"
        options={countryOpts}
        filterOption={(input, option) =>
          option?.label?.toLowerCase().includes(input.toLowerCase())
        }
        onChange={handleChangeCountry}
        style={{
          marginLeft: '5px',
          width: '97%',
          height: '50%',
          padding: isMobile ? '0px' : '4px',
          fontSize: isMobile ? '14px' : '18px',
          fontFamily: 'var(--font-archia), sans-serif',
          borderRadius: '8px',
          border: '1px solid #ccc',
        }}
      />

      <div style={{ marginTop: isMobile ? '0px' : '20px' }}>
        {categories.map((category) => (
          <div
            key={category.attributes.categoryId}
            onClick={() => handleCategoryClick(category)}
            style={{
              fontFamily: 'var(--font-archia), sans-serif',
              padding: '10px 20px',

              paddingTop: '20px',

              fontSize: isMobile ? '16px' : '18px',
              color: '#1B2738',
              fontWeight: isCategorySelected(category) ? 'bold' : 'normal',
              backgroundColor: isCategorySelected(category)
                ? '#E3DDFD'
                : 'transparent',
              width: '100%',
              marginBottom: isMobile ? '0px' : '10px',
              cursor: 'pointer',
              userSelect: 'none',
              border: 'none',
              boxShadow: 'none',
            }}
          >
            {category.attributes.name}
          </div>
        ))}
      </div>

      {queryParameters.categoryId && queryParameters.country && !isMobile && (
        <Button
          type="primary"
          style={{
            margin: '450px 15px',
            width: '90%',
            height: '45px',
            fontSize: '16px',
            backgroundColor: '#ffffff',
            border: '1px solid #1B2738',
            borderRadius: '35px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={handleViewGlobalDataClick}
        >
          View Global Data →
        </Button>
      )}
    </Sider>
  )
}

export default CategoriesNestedDashboard
