import React, { useEffect, useState } from 'react'
import { Layout, Typography, Menu, Tag } from 'antd'
import { CloseCircleFilled } from '@ant-design/icons'
import useQueryParameters from '../../../../hooks/useQueryParameters'
import useIndicators from '../../../../hooks/useIndicators'
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
      style={{
        position: isMobile ? 'sticky' : 'relative',
        top: isMobile ? 0 : 'auto',
        zIndex: isMobile ? 1000 : 'auto',
        overflow: 'auto',
        backgroundColor: 'white',
        paddingTop: '0px',
      }}
    >
      <Menu
        defaultSelectedKeys={['1']}
        mode={isMobile ? 'vertical' : 'inline'}
        style={{ maxHeight: '100%' }}
      >
        {categories.map((category) => (
          <div key={category.attributes.categoryId}>
            <Menu.Item
              key={category.attributes.categoryId}
              onClick={() => handleCategoryClick(category)}
              className={isCategorySelected(category) ? 'selected' : ''}
            >
              <img
                className="ant-menu-item-icon"
                src={
                  category.attributes.categoryIcon
                    ? `https://unep-gpml.akvotest.org${category.attributes.categoryIcon[0].url}`
                    : ''
                }
                style={{ marginRight: '10px' }}
              />
              <span style={{ font: 'inter', fontSize: '14px' }}>
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
                  <Tag
                    style={{
                      borderRadius: '40px',
                      width: '65%',
                      height: '32px',
                      marginLeft: '25px',
                      backgroundColor: '#2D3648',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '20px',
                      overflow: 'hidden',
                      padding: '0 10px',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: 'calc(100% - 40px)',
                        overflow: 'hidden',
                      }}
                      title={layer.name}
                    >
                      <Typography.Text
                        style={{
                          color: 'white',
                          fontSize: '12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          paddingLeft: '20px',
                          variant: 'typography/body2',
                        }}
                      >
                        {layer.name}
                      </Typography.Text>
                    </div>
                    <CloseCircleFilled
                      onClick={() => handleCloseLayer(layer.id)}
                      style={{
                        color: 'gray',
                        width: '20px',
                        height: '20px',
                        paddingLeft: '10px',
                      }}
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
