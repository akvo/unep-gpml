import React, { useState } from 'react'
import { Layout, Select, Button } from 'antd'
import useQueryParameters from '../../../../hooks/useQueryParameters'
import { UIStore } from '../../../../store'
import { isEmpty } from 'lodash'

const { Sider } = Layout

const CategoriesNestedDashboard = ({ categories }) => {
  const { queryParameters, setQueryParameters } = useQueryParameters()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)

  const { countries, transnationalOptions } = UIStore.useState((s) => ({
    countries: s.countries,
    transnationalOptions: s.transnationalOptions,
    landing: s.landing,
  }))

  const isLoaded = () => !isEmpty(countries) && !isEmpty(transnationalOptions)

  const countryOpts = isLoaded()
    ? countries
        .filter(
          (country) => country.description.toLowerCase() === 'member state'
        )
        .map((it) => ({ value: it.id, label: it.name }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : []

  const handleChangeCountry = (val) => {
    const selected = countries?.find((x) => x.id === val)

    const newParams = {
      country: selected?.name,
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

  const isCategorySelected = (category) => {
    return queryParameters.categoryId === category.attributes.categoryId
  }

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      width={360}
      style={{ backgroundColor: '#ffffff', height: '100%', padding: '10px' }}
    >
      <Select
        size="large"
        showArrow
        allowClear
        placeholder="Select Country"
        options={countryOpts}
        filterOption={(input, option) =>
          option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        onChange={handleChangeCountry}
        style={{
          marginLeft: '15px',
          width: '90%',
          height: '50px',
          padding: '4px',
          fontSize: '18px',
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
              padding: '10px 20px',
              fontSize: '16px',
              color: '#1B2738',
              fontWeight: isCategorySelected(category) ? 'bold' : 'normal',
              backgroundColor: isCategorySelected(category)
                ? '#E3DDFD'
                : 'transparent',
              borderRadius: '8px',
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
      >
        View Global Data →
      </Button>
    </Sider>
  )
}

export default CategoriesNestedDashboard
