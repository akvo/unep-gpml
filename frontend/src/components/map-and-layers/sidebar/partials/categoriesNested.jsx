import React, { useEffect, useState } from 'react'
import { Layout, Typography, Menu, Tag } from 'antd'
import { CloseCircleFilled } from '@ant-design/icons'
import useQueryParameters from '../../../../hooks/useQueryParameters'
import Subcategories from './../partials/subcategories'
import useSubcategories from '../../../../hooks/useSubcategories'
import { useRouter } from 'next/router'

const { Sider } = Layout

const CategoriesNested = ({ categories, layers }) => {
  const { queryParameters, setQueryParameters } = useQueryParameters()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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
    const newParams = {
      categoryId: category.attributes.categoryId,
    }

    setQueryParameters(newParams)
    setSelectedCategory(category.attributes.categoryId)
  }
  const subcategories = useSubcategories(categoryId)

  const subcategoriesByCategory = subcategories?.subcategories?.data?.filter(
    (subcategory) =>
      subcategory.attributes.categoryId === queryParameters.categoryId
  )

  const handleCloseLayer = (layerId) => {
    const updatedLayers = queryParameters.layers?.filter(
      (layer) => layer.id !== layerId
    )
    setQueryParameters({ layers: updatedLayers })
  }
  const isCategorySelected = (category) => {
    return queryParameters.categoryId === category.attributes.categoryId
  }

  return (
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
      <Menu defaultSelectedKeys={['1']} mode={isMobile ? 'vertical' : 'inline'}>
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
                subcategories={subcategoriesByCategory}
                layers={layers}
              />
            )}
            {queryParameters.layers &&
              queryParameters.layers
                ?.filter(
                  (layer) => layer.categoryId === category.attributes.categoryId
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
  )
}

export default CategoriesNested
