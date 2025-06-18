import { Typography, Collapse, Switch, Space } from 'antd'
import React, { useState, useEffect } from 'react'
import { RightOutlined } from '@ant-design/icons'
import {
  useGlobalLayer,
  setGlobalLayer,
} from '../../../../hooks/useGlobalLayer'

import { Tooltip } from 'antd'
import styles from './../index.module.scss'
import { InfoCircleFilled } from '@ant-design/icons'
import LayerInfo from './layerInfo'
import { useRouter } from 'next/router'
const { Panel } = Collapse
const Subcategories = ({ subcategories, layers, loading, categoryId }) => {
  const selectedLayer = useGlobalLayer()
  const [expandedSubcategory, setExpandedSubcategory] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (router.query.subcategoryId !== expandedSubcategory) {
      setExpandedSubcategory(router.query.subcategoryId || null)
    }
  }, [])

  const handleSubcategoryChange = (key) => {
    if (expandedSubcategory === key) {
      closeExpanded()
    } else {
      setExpandedSubcategory(key)
      const dRoute = {
        pathname: router.pathname,
        query: {
          ...router.query,
          categoryId: categoryId ?? '',
          subcategoryId: key ?? '',
          layer: selectedLayer?.attributes?.arcgislayerId ?? '',
        },
      }

      const newUrl = `${dRoute.pathname}?categoryId=${dRoute.query.categoryId}&subcategoryId=${dRoute.query.subcategoryId}&layer=${dRoute.query.layer}`
      window.history.replaceState(null, '', newUrl)
    }
  }

  const closeExpanded = () => {
    setExpandedSubcategory('')
    const dRoute = {
      pathname: router.pathname,
      query: {
        ...router.query,
        categoryId: categoryId ?? '',
        subcategoryId: '',
        layer: selectedLayer?.attributes?.arcgislayerId ?? '',
      },
    }

    const newUrl = `${dRoute.pathname}?categoryId=${dRoute.query.categoryId}&subcategoryId=&layer=${dRoute.query.layer}`
    window.history.replaceState(null, '', newUrl)
  }

  const handleLayerClick = (layer, close = false) => {
    if (close) {
     closeExpanded()
    }
    if (layer === selectedLayer) {
      setGlobalLayer(null)
    } else {
      setGlobalLayer(layer)
    }

    const dRoute = {
      pathname: router.pathname,
      query: {
        ...router.query,
        categoryId: categoryId ?? '',
        subcategoryId: expandedSubcategory ?? '',
        layer: layer === selectedLayer ? '' : layer.attributes.arcgislayerId,
      },
    }

    const newUrl = `${dRoute.pathname}?categoryId=${dRoute.query.categoryId}&subcategoryId=${dRoute.query.subcategoryId}&layer=${dRoute.query.layer}`
    window.history.replaceState(null, '', newUrl)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  let filteredLayers = layers.filter(
    (layer) => layer.attributes.subcategoryId === expandedSubcategory
  )

  return (
    <>
      <div className={styles.sidebarSm}>
        {subcategories?.map((subcategory, index) => (
          <>
            <Typography
              className={styles.menuSmSubHeader}
              onClick={() =>
                handleSubcategoryChange(subcategory.attributes.subcategoryId)
              }
            >
              {subcategory.attributes.subcategoryName}
            </Typography>
            <div className={styles.menuSmBtnContainer}>
              {subcategory.attributes.subcategoryId === expandedSubcategory &&
                filteredLayers.slice().map((layer, layerIndex) => (
                  <div
                    key={layerIndex}
                    className={`${styles.menuItem}`}
                    style={{
                      backgroundColor: layer === selectedLayer ? '#f5f5f5' : '',
                    }}
                    
                  >
                    <Typography className={styles.menuItemText} onClick={() => handleLayerClick(layer, true)}>
                      {' '}
                      {layer.attributes.title}
                    </Typography>
                    <Space size="middle" className={styles.menuIcons}>
                      {' '}
                      <Tooltip
                        overlayStyle={{ maxWidth: '600px', width: 'auto' }}
                        overlay={
                          <LayerInfo
                            layer={filteredLayers?.find(
                              (layerInfoItem) =>
                                layerInfoItem.arcgislayerId ===
                                  layer.arcgislayerId &&
                                layerInfoItem.id === layer.id
                            )}
                          ></LayerInfo>
                        }
                        overlayInnerStyle={{
                          backgroundColor: 'white',
                          width: 'auto',
                          height: 'auto',
                        }}
                      >
                        <InfoCircleFilled
                          style={{
                            color: 'rgba(0, 0, 0, 0.45)',
                          }}
                          onClick={() => null}
                        />
                      </Tooltip>
                      <RightOutlined onClick={() => handleLayerClick(layer, true)} />
                    </Space>
                  </div>
                ))}
            </div>
          </>
        ))}
      </div>
      <div className={styles.sidebarLg}>
        <Collapse
          accordion
          ghost
          expandIconPosition="right"
          destroyInactivePanel
          onChange={handleSubcategoryChange}
          activeKey={expandedSubcategory}
          expandIcon={({ isActive }) => (
            <RightOutlined
              rotate={isActive ? 90 : 0}
              style={{ fontSize: 16 }}
            />
          )}
        >
          {subcategories?.map((subcategory, index) => (
            <Panel
              key={subcategory.attributes.subcategoryId}
              header={subcategory.attributes.subcategoryName}
              style={{ overflow: 'auto' }}
            >
              {filteredLayers.slice().map((layer, layerIndex) => (
                <div
                  className="layer-item"
                  key={`${subcategory.attributes.subcategoryId}-${layerIndex}`}
                >
                  <Switch
                    size="small"
                    onChange={() => handleLayerClick(layer)}
                    checked={selectedLayer && selectedLayer.id === layer.id}
                  />

                  <Typography className="layer-name">
                    {layer.attributes.title}
                  </Typography>

                  <Tooltip
                    overlayStyle={{ maxWidth: '600px', width: 'auto' }}
                    overlay={
                      <LayerInfo
                        layer={filteredLayers?.find(
                          (layerInfoItem) =>
                            layerInfoItem.arcgislayerId ===
                              layer.arcgislayerId &&
                            layerInfoItem.id === layer.id
                        )}
                      ></LayerInfo>
                    }
                    overlayInnerStyle={{
                      backgroundColor: 'white',
                      width: 'auto',
                      height: 'auto',
                    }}
                  >
                    <InfoCircleFilled
                      style={{
                        color: 'rgba(0, 0, 0, 0.45)',
                      }}
                      onClick={() => null}
                    />
                  </Tooltip>
                </div>
              ))}
            </Panel>
          ))}
        </Collapse>
      </div>
    </>
  )
}

export default Subcategories
