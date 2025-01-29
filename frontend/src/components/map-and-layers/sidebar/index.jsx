import React, { useState } from 'react'
import Categories from './partials/categories'
import useCategories from '../../../hooks/useCategories'
import useSubcategories from '../../../hooks/useSubcategories'
import styles from './index.module.scss'
import CategoriesNested from './partials/categoriesNested'
import CategoriesNestedDashboard from './partials/CategoriesNestedDashboard'

const Sidebar = ({ alt, countryDashboard, layers }) => {
  const [showLayerSidebar, setShowLayerSidebar] = useState(false)

  const { categories, loading } = useCategories()
  const subcategories = useSubcategories()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!categories || categories.length === 0 || !Array.isArray(categories)) {
    return <div>No categories available.</div>
  }

  const handleCategoryClick = () => {
    setShowLayerSidebar(true)
  }

  return (
    <div className={styles.container}>
      {countryDashboard ? (
        <CategoriesNestedDashboard
          categories={categories}
          subcategories={subcategories}
          countryDashboard={countryDashboard}
        />
      ) : (
        <CategoriesNested
          categories={categories}
          subcategories={subcategories}
          countryDashboard={countryDashboard}
          layers={layers}
        />
      )}
    </div>
  )
}

export default Sidebar
