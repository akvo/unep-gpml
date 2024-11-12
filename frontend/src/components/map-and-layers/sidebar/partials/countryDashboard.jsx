import React, { useState } from 'react'
import { Layout, Menu } from 'antd'
import useQueryParameters from '../../../../hooks/useQueryParameters'

const { Sider } = Layout
const CategoriesNested = ({ categories }) => {
  const { queryParameters, setQueryParameters } = useQueryParameters()
  const [selectedCategory, setSelectedCategory] = useState(null)

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
    <Sider breakpoint="lg" collapsedWidth="0" overflow={'auto'} width={360}>
      <div className="caps-heading-s">Topics</div>
      <Menu defaultSelectedKeys={['1']} overflow={'auto'}>
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
          </div>
        ))}
      </Menu>
    </Sider>
  )
}
export default CategoriesNested
