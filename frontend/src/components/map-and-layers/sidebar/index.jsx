import React, { useState, useEffect } from 'react'
import CategoriesNested from './partials/categoriesNested'
import CategoriesNestedDashboard from './partials/CategoriesNestedDashboard'
import useCategories from '../../../hooks/useCategories'
import useSubcategories from '../../../hooks/useSubcategories'
import styles from './index.module.scss'
import styled from 'styled-components'
import { UIStore } from '../../../store'
import { isEmpty } from 'lodash'
import { Layout, Select } from 'antd'
import useQueryParameters from '../../../hooks/useQueryParameters'
import { t } from '@lingui/macro'
import { useRouter } from 'next/router'

const { Sider } = Layout

const Sidebar = ({ countryDashboard, layers }) => {
  const router = useRouter()
  const { pathname, query } = router

  const [isMobile, setIsMobile] = useState(false)
  const { queryParameters, setQueryParameters } = useQueryParameters()
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const { loading } = useCategories()
  const catsData = useCategories()?.categories
  const categories = countryDashboard
    ? catsData.filter(
        (d) => d.attributes.categoryId !== 'governance-and-regulations'
      )
    : catsData
  const subcategories = useSubcategories()

  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const { countries } = UIStore.useState((s) => ({
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

  const categoriesOpts = isLoaded()
    ? categories.map((it) => ({
        value: it.id,
        label: it.attributes.categoryDescription,
      }))
    : []

  const handleChangeCountry = (val) => {
    const selected = countries.find((d) => d.id === val)
    setSelectedCountry(selected?.name)
    if (countryDashboard) {
      const newParams = {
        country: selected?.name,
        countryCode: selected?.isoCodeA3,
      }

      setQueryParameters(newParams)
    }
  }

  const handleCategoryClick = (category) => {
    if(selectedCategory === category.attributes.categoryDescription.trim()) {
    setSelectedCategory('')
    setSelectedCategoryId('')
    } else {
    setSelectedCategory(category.attributes.categoryDescription.trim())
    setSelectedCategoryId(category.attributes.categoryId)
    }

  }

  const handleCategory = (category) => {
    const selected = categories?.find((x) => x.id === category)

    if (selected.attributes.categoryDescription === selectedCategory) return
    if (countryDashboard) {
      const newParams = {
        categoryId: selected.attributes.categoryId,
      }
      setQueryParameters(newParams)
    }

    setSelectedCategoryId(selected.attributes.categoryId)
    setSelectedCategory(selected.attributes.categoryDescription)
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (
      (selectedCategory === null || selectedCategory === undefined) &&
      query?.categoryId &&
      categories.length > 0
    ) {
      const selected = categories?.find(
        (x) => x.attributes.categoryId === query?.categoryId
      )
      setSelectedCategory(selected.attributes.categoryDescription)
      setSelectedCategoryId(query?.categoryId)
    }
  }, [query?.categoryId, categories])

  useEffect(() => {
    if (
      (selectedCountry === null || selectedCountry === undefined) &&
      query?.country &&
      categories.length > 0
    ) {
      setSelectedCountry(query?.country)
    }
  }, [query?.country, categories])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!categories || categories.length === 0 || !Array.isArray(categories)) {
    return <div>No categories available.</div>
  }

  const handleToggleSidebar = () => {
    setIsSidebarExpanded((prevState) => !prevState)
  }

  return (
    <div className={styles.container}>
      {isMobile && !countryDashboard && (
        <>
          <div className={styles.mobileHeader} onClick={handleToggleSidebar}>
            <span>Topics</span>
            <span>{isSidebarExpanded ? '▲' : '▼'}</span>
          </div>
          {isSidebarExpanded && (
            <CategoriesNested
              categories={categories}
              subcategories={subcategories}
              layers={layers}
              countryDashboard={countryDashboard}
              selectedCategoryId={selectedCategoryId}
              handleCategoryParentClick={handleCategoryClick}
            />
          )}
        </>
      )}

      {countryDashboard && (
        <CustomSiderWrapper>
          <StyledSider breakpoint="lg">
            <Title>{t`National data`}</Title>
            <CustomSelect
              showSearch
              size="large"
              value={selectedCountry ? selectedCountry : ''}
              placeholder="Search Country"
              options={countryOpts}
              suffixIcon={<DropdownSvg />}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              onChange={handleChangeCountry}
            />

            <CustomSelect
              showSearch
              size="large"
              value={selectedCategory}
              placeholder="Select Category"
              options={categoriesOpts}
              suffixIcon={<DropdownSvg />}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              onChange={handleCategory}
            />
          </StyledSider>
        </CustomSiderWrapper>
      )}

      <Container>
        {countryDashboard && (
          <CategoriesNestedDashboard
            categories={categories}
            subcategories={subcategories}
            countryDashboard={countryDashboard}
            handleCategoryParentClick={handleCategoryClick}
          />
        )}
        {!countryDashboard && (
          <CategoriesNested
            categories={categories}
            layers={layers}
            subcategories={subcategories}
            countryDashboard={countryDashboard}
            selectedCategoryId={selectedCategoryId}
            handleCategoryParentClick={handleCategoryClick}
          />
        )}
      </Container>
    </div>
  )
}

export default Sidebar

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

const CustomSiderWrapper = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: block;
    .ant-layout-sider {
      .ant-select {
        width: calc(100% - 50px);
        .ant-select-selector {
          height: auto !important;
        }
      }
    }
    .ant-layout-sider-collapsed {
      width: 100% !important;
      max-width: 100% !important;
    }
  }
`

const StyledSider = styled(Sider)`
  height: 200px !important;
  overflow: hidden;
  width: 100% !important;
  .ant-layout-sider-children {
    height: auto !important;
    width: 100% !important;
    overflow: hidden;
  }
`

const Title = styled.h1`
  color: #6236ff;
  line-height: 14px;
  font-size: 16px;
  font-weight: bold;
  padding: 20px 40px 10px 30px;
`
const CustomSelect = styled(Select)`
  width: 100%;
  margin: 10px;
  .ant-select-selector {
    height: auto !important;
  }
`

const Container = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`
