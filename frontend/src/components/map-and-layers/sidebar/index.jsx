import React, { useState, useEffect } from 'react'
import CategoriesNested from './partials/categoriesNested'
import CategoriesNestedDashboard from './partials/CategoriesNestedDashboard'
import useCategories from '../../../hooks/useCategories'
import useSubcategories from '../../../hooks/useSubcategories'
import styles from './index.module.scss'

const Sidebar = ({ countryDashboard, layers }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  const { categories, loading } = useCategories()
  const subcategories = useSubcategories()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      {isMobile ? (
        <>
          <div className={styles.mobileHeader} onClick={handleToggleSidebar}>
            <span>Topics</span>
            <span>{isSidebarExpanded ? '▲' : '▼'}</span>
          </div>
          {isSidebarExpanded && (
            <>
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
                  layers={layers}
                  countryDashboard={countryDashboard}
                />
              )}
            </>
          )}
        </>
      ) : (
        <>
          {countryDashboard && (
            <CategoriesNestedDashboard
              categories={categories}
              subcategories={subcategories}
              countryDashboard={countryDashboard}
            />
          )}
          {!countryDashboard && (
            <CategoriesNested
              categories={categories}
              layers={layers}
              subcategories={subcategories}
              countryDashboard={countryDashboard}
            />
          )}
        </>
      )}
    </div>
  )
}

export default Sidebar
