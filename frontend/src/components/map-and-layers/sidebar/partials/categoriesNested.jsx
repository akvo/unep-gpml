import React, { useEffect, useState } from 'react'
import { Layout, Typography, Menu, Tag } from 'antd'
import { CloseCircleFilled } from '@ant-design/icons'
import useQueryParameters from '../../../../hooks/useQueryParameters'
import Subcategories from './../partials/subcategories'
import useSubcategories from '../../../../hooks/useSubcategories'
import { useRouter } from 'next/router'
import {
  useGlobalLayer,
  setGlobalLayer,
} from '../../../../hooks/useGlobalLayer'
import styles from './../index.module.scss'

const { Sider } = Layout

const CategoriesNested = ({
  categories,
  layers,
  handleCategoryParentClick,
  selectedCategoryId,
}) => {
  const selectedLayer = useGlobalLayer()
  const { queryParameters, setQueryParameters } = useQueryParameters()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const categoryId = router.isReady ? router.query.categoryId : undefined

  const handleCategoryClick = (category) => {
    const dRoute = {
      pathname: router.pathname,
      query: {
        ...router.query,
        categoryId: category.attributes.categoryId,
        subcategoryId: '',
        layer: selectedLayer?.attributes?.arcgislayerId ?? '',
      },
    }

    const newUrl = `${dRoute.pathname}?categoryId=${category.attributes.categoryId}&subcategoryId=${dRoute.query.subcategoryId}&layer=${dRoute.query.layer}`
    window.history.replaceState(null, '', newUrl)
    handleCategoryParentClick(category)
  }
  const subcategories = useSubcategories(categoryId)

  const subcategoriesByCategory = subcategories?.subcategories?.data?.filter(
    (subcategory) => subcategory.attributes.categoryId === selectedCategoryId
  )

  const handleCloseLayer = (layerId) => {
    const updatedLayers = queryParameters.layers?.filter(
      (layer) => layer.id !== layerId
    )
    setQueryParameters({ layers: updatedLayers ?? '' })
  }
  const isCategorySelected = (category) => {
    return selectedCategoryId === category.attributes.categoryId
  }

  const handleToggleSidebar = () => {
    setIsSidebarExpanded((prevState) => !prevState)
  }

  return (
    <>
      <div className={styles.sidebarSm}>
        <div className={styles.mobileMenu}>
          <div className={styles.menuHeader} onClick={handleToggleSidebar}>
            <span>TOPICS</span>
            {isSidebarExpanded ? <MenuIconUpSvg /> : <MenuIconDownSvg />}
          </div>
          {isSidebarExpanded &&
            categories.map((category) => (
              <>
                <div
                  className={styles.menuSubHeader}
                  key={category.attributes.categoryId}
                  onClick={() => handleCategoryClick(category)}
                >
                  <span> {category.attributes.name}</span>
                  {isCategorySelected(category) ? (
                    <MenuIconUpSvg color="#000647" />
                  ) : (
                    <MenuIconDownSvg color="#000647" />
                  )}
                </div>
                 {isCategorySelected(category) && (
                  <Subcategories
                    categoryId={category.attributes.categoryId}
                    subcategories={subcategoriesByCategory}
                    layers={layers}
                  />
                )}
                {queryParameters.layers &&
                  queryParameters.layers
                    ?.filter(
                      (layer) =>
                        layer.categoryId === category.attributes.categoryId
                    )
                    .map((layer) => (
                      <Tag className="layer-tag">
                        <div title={layer.name}>
                          <Typography.Text className="layer-tag-text">
                            {layer.name}
                          </Typography.Text>
                        </div>
                        <CloseCircleFilled
                          onClick={() => handleCloseLayer(layer.id)}
                        />
                      </Tag>
                    ))}
              </>
            ))}
        </div>
      </div>
      <div className={styles.sidebarLg}>
        <Sider
          breakpoint="lg"
          collapsedWidth="100%"
          width={isMobile ? '100%' : 360}
          collapsible
          collapsed={isCollapsed}
          trigger={null}
          onCollapse={(collapsed) => setIsCollapsed(collapsed)}
          className="sidebar"
        >
          <Menu
            defaultSelectedKeys={['1']}
            mode={isMobile ? 'vertical' : 'inline'}
          >
            {categories.map((category) => (
              <div key={category.attributes.categoryId}>
                <Menu.Item
                  key={category.attributes.categoryId}
                  onClick={() => handleCategoryClick(category)}
                  className={isCategorySelected(category) ? 'selected' : ''}
                >
                  <span style={{ marginLeft: '15px' }}>
                    {category.attributes.name}
                  </span>
                </Menu.Item>
                {isCategorySelected(category) && (
                  <Subcategories
                    categoryId={category.attributes.categoryId}
                    subcategories={subcategoriesByCategory}
                    layers={layers}
                  />
                )}
                {queryParameters.layers &&
                  queryParameters.layers
                    ?.filter(
                      (layer) =>
                        layer.categoryId === category.attributes.categoryId
                    )
                    .map((layer) => (
                      <Tag className="layer-tag">
                        <div title={layer.name}>
                          <Typography.Text className="layer-tag-text">
                            {layer.name}
                          </Typography.Text>
                        </div>
                        <CloseCircleFilled
                          onClick={() => handleCloseLayer(layer.id)}
                        />
                      </Tag>
                    ))}
              </div>
            ))}
          </Menu>
        </Sider>
      </div>
    </>
  )
}

export default CategoriesNested

const MenuIconUpSvg = ({ color = 'white' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M23 13L12 2L1 13" stroke={color} stroke-width="2" />
  </svg>
)

const MenuIconDownSvg = ({ color = 'white' }) => (
  <svg
    width="20"
    height="12"
    viewBox="0 0 20 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      width="20"
      height="20"
      d="M1 1.5L10 10.5L19 1.5"
      stroke={color}
      stroke-width="2"
    />
  </svg>
)
