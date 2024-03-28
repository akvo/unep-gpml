import React from 'react'
// import styled from 'styled-components'
import { Layout, Typography, Menu, Tag } from 'antd'
import { useRouter } from 'next/router'
import useQueryParameters from '../../../../hooks/useQueryParameters'
import { CloseCircleFilled } from '@ant-design/icons'

const { Sider } = Layout

const Categories = ({ categories, onCategoryClick }) => {
  const router = useRouter()
  const { categoryId } = router.query

  const {
    queryParameters,
    setQueryParameters,
    createQueryParametersString,
  } = useQueryParameters()

  const handleCategoryClick = (category) => {
    const updatedLayers = [...queryParameters.layers]
    onCategoryClick(category)

    const queryParametersString = createQueryParametersString({
      sidebar: 'show',
      layers: updatedLayers,
    })

    router.push({
      pathname: `/data/maps/${category.categoryId}`,
      query: queryParametersString,
    })
  }
  const isCategorySelected = (category) => {
    return categoryId === category.id
  }

  const handleCloseLayer = (layerId) => {
    const updatedLayers = queryParameters.layers.filter(
      (layer) => layer.id !== layerId
    )

    const queryParametersString = createQueryParametersString({
      sidebar: 'show',
      layers: updatedLayers,
    })

    setQueryParameters({ layers: [] })

    // navigate({ search: queryParametersString })
  }

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      onBreakpoint={(broken) => {
        console.log(broken)
      }}
      onCollapse={(collapsed, type) => {
        console.log(collapsed, type)
      }}
    >
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
          <div key={category.categoryId}>
            <Menu.Item
              key={category.categoryId}
              onClick={() => handleCategoryClick(category)}
              className={isCategorySelected(category) ? 'selected' : ''}
            >
              <img
                className="ant-menu-item-icon"
                src={
                  category.categoryIcon
                    ? `https://unep-gpml.akvotest.org${category.categoryIcon[0].url}`
                    : ''
                }
                style={{ marginRight: '10px' }}
              />
              <span style={{ font: 'inter', fontSize: '14px' }}>
                {category.name}
              </span>
            </Menu.Item>
            {queryParameters.layers &&
              queryParameters.layers
                .filter((layer) => layer.categoryId === category.categoryId)
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

export default Categories

// const StyledSider = styled(Sider)`
//   background: #ffffff;
//   border-right: 2px solid #717d96;
//   min-width: 50% !important;
//   width: 50% !important;
//   padding-top: 35px;
//   height: 100%;
// `

// const CustomMenu = styled(Menu)`
//   .ant-menu-item-selected {
//     background-color: white !important;
//     margin-left: 10px;
//   }
// `

// const CustomMenuItem = styled(Menu.Item)`
//   && {
//     padding-left: 10px;
//     padding-bottom: 6px;
//     border: none;
//     font-size: 14px;
//     color: #2d3648;
//     outline: none;
//   }
// `
