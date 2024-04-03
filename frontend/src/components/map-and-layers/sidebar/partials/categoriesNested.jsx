import React from 'react'
import { Layout, Typography, Menu, Tag } from 'antd'
import { CloseCircleFilled } from '@ant-design/icons'
import useQueryParameters from '../../../../hooks/useQueryParameters'
import useSubcategories from '../../../../hooks/useSubcategories'
import Subcategories from './../partials/subcategories'

const { Sider } = Layout

const CategoriesNested = ({ categories, onCategoryClick }) => {
  const { queryParameters, setQueryParameters } = useQueryParameters()
  console.log(queryParameters)
  const handleCategoryClick = (category) => {
    onCategoryClick(category)
    setQueryParameters({ categoryId: category.attributes.categoryId })
  }
  const subcategories = useSubcategories(queryParameters.categoryId)
  const handleCloseLayer = (layerId) => {
    const updatedLayers = queryParameters.layers.filter(
      (layer) => layer.id !== layerId
    )
    setQueryParameters({ layers: updatedLayers })
  }

  const isCategorySelected = (category) => {
    return queryParameters.categoryId === category.attributes.categoryId
  }

  return (
    <Sider breakpoint="lg" collapsedWidth="0" width={360}>
      <Typography.Title
        level={5}
        style={{
          color: '#717D96',
          marginLeft: '10px',
          fontSize: '12px',
          variant: 'typography/body2',
        }}
      >
        TOPICS
      </Typography.Title>
      <Menu defaultSelectedKeys={['1']}>
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
              <Subcategories subcategories={subcategories} />
            )}
            {queryParameters.layers &&
              queryParameters.layers
                .filter(
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
