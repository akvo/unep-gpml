import React, { useState } from 'react'
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

  const { countries, transnationalOptions } = UIStore.useState((s) => ({
    countries: s.countries,
    transnationalOptions: s.transnationalOptions,
    landing: s.landing,
  }))

  const isLoaded = () => !isEmpty(countries)

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

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      width={360}
      style={{
        height: '100%',
        padding: '0',
        margin: '0',
      }}
    >
      <div
        style={{
          marginLeft: '15px',
          marginTop: '10px',
          marginBottom: '20px',
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'var(--font-archia), sans-serif',
          color: '#7468ff',
        }}
      >
        NATIONAL DATA
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
          marginLeft: '10px',
          width: '90%',
          height: '50px',
          padding: '4px',
          fontSize: '18px',
          fontFamily: 'var(--font-archia), sans-serif',
          borderRadius: '8px',
          border: '1px solid #ccc',
        }}
      />

      <div style={{ marginTop: '20px' }}>
        {categories.map((category) => (
          <div
            key={category.attributes.categoryId}
            onClick={() => handleCategoryClick(category)}
            style={{
              fontFamily: 'var(--font-archia), sans-serif',
              padding: '10px 20px',
              fontSize: '18px',
              color: '#1B2738',
              fontWeight: isCategorySelected(category) ? 'bold' : 'normal',
              backgroundColor: isCategorySelected(category)
                ? '#E3DDFD'
                : 'transparent',
              width: '100%',
              marginBottom: '10px',
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

      {queryParameters.categoryId && queryParameters.country && (
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
