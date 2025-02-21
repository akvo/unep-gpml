import React, { useEffect, useState } from 'react'
import { Layout, Select, Button } from 'antd'
import useQueryParameters from '../../../../hooks/useQueryParameters'
import { UIStore } from '../../../../store'
import { isEmpty } from 'lodash'
import { getBaseUrl } from '../../../../utils/misc'
import classNames from 'classnames'

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
    <Sider breakpoint="lg" collapsedWidth="100%" width={360}>
      <div className="caps-heading-s" onClick={handleBackToHomePage}>
        <span style={{ fontSize: '14px' }}>←</span> NATIONAL DATA
      </div>
      <Select
        showSearch
        size="large"
        value={queryParameters.country ? queryParameters.country : ''}
        placeholder="Search Country"
        options={countryOpts}
        suffixIcon={<DropdownSvg />}
        filterOption={(input, option) =>
          option?.label?.toLowerCase().includes(input.toLowerCase())
        }
        onChange={handleChangeCountry}
      />

      <div style={{ marginTop: isMobile ? '0px' : '20px' }} className="nav">
        {categories.map((category) => (
          <div
            key={category.attributes.categoryId}
            onClick={() => handleCategoryClick(category)}
            className={classNames('nav-item', {
              selected: isCategorySelected(category),
            })}
          >
            {category.attributes.name}
          </div>
        ))}
      </div>

      {queryParameters.categoryId && queryParameters.country && !isMobile && (
        <Button type="ghost" style={{}} onClick={handleViewGlobalDataClick}>
          View Global Data →
        </Button>
      )}
    </Sider>
  )
}

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
export default CategoriesNestedDashboard