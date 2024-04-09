import React, { useState } from 'react'
import useQueryParameters from '../../../hooks/useQueryParameters'
import Categories from './partials/categories'
import useCategories from '../../../hooks/useCategories'
import useSubcategories from '../../../hooks/useSubcategories'
import { useRouter } from 'next/router'
import Subcategories from './partials/subcategories'
import styles from './index.module.scss'
import CategoriesNested from './partials/categoriesNested'

const Sidebar = ({ alt }) => {
  const { setQueryParameters, queryParameters } = useQueryParameters()
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

  const handleCollapseToggle = () => {
    const newSidebarState = queryParameters.sidebar === 'show' ? 'hide' : 'show'

    setShowLayerSidebar(!showLayerSidebar)
    setQueryParameters({ ...queryParameters, sidebar: newSidebarState })
  }

  return (
    <div className={styles.container}>
      {alt ? (
        <>
          <CategoriesNested
            categories={categories}
            subcategories={subcategories}
          />
        </>
      ) : (
        <>
          <Categories
            categories={categories}
            onCategoryClick={handleCategoryClick}
          />
          {showLayerSidebar && <Subcategories subcategories={subcategories} />}
        </>
      )}
    </div>
  )
}
export default Sidebar
