import { Typography, Collapse, Switch } from 'antd'
import React, { useState, useEffect } from 'react'
import useQueryParameters from '../../../../hooks/useQueryParameters'
import { Tooltip } from 'antd'

import { InfoCircleFilled } from '@ant-design/icons'
import LayerInfo from './layerInfo'
import { useRouter } from 'next/router'
const { Panel } = Collapse
const Subcategories = ({ subcategories, layers, loading }) => {
  const { queryParameters, setQueryParameters } = useQueryParameters()
  const [expandedSubcategory, setExpandedSubcategory] = useState(null)
  const router = useRouter()
  useEffect(() => {
    const layersParam = queryParameters.layers
    if (layersParam) {
      const selectedLayers = Array.isArray(layersParam)
        ? layersParam
        : layersParam.split(',')
      setQueryParameters({ layers: selectedLayers })
    }
  }, [])
  console.log('xx')

  useEffect(() => {
    if (router.query.subcategoryId !== expandedSubcategory) {
      setExpandedSubcategory(router.query.subcategoryId || null)
    }
  }, [])

  const handleSubcategoryChange = (key) => {
    setExpandedSubcategory(key)

    setQueryParameters({
      categoryId: router.query.categoryId,
      subcategoryId: key,
    })
  }
  const handleLayerClick = (layer) => {
    const isLayerSelected =
      queryParameters.layers && queryParameters.layers.id === layer.id

    if (isLayerSelected) {
      setQueryParameters({
        categoryId: router.query.categoryId,
        subcategoryId: router.query.subcategoryId,
        layers: undefined,
      })
    } else {
      setQueryParameters({
        categoryId: router.query.categoryId,
        subcategoryId: router.query.subcategoryId,
        layers: [layer],
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  let filteredLayers = layers.filter(
    (layer) => layer.attributes.subcategoryId === expandedSubcategory
  )

  return (
    <div>
      <Collapse
        accordion
        ghost
        expandIconPosition="right"
        destroyInactivePanel
        onChange={handleSubcategoryChange}
        activeKey={expandedSubcategory}
      >
        {subcategories?.map((subcategory, index) => (
          <Panel
            key={subcategory.attributes.subcategoryId}
            header={subcategory.attributes.subcategoryName}
            style={{overflow:"auto"}}
          >
            {filteredLayers
              .slice()
              .map((layer, layerIndex) => (
                <div
                  className="layer-item"
                  key={`${subcategory.attributes.subcategoryId}-${layerIndex}`}
                >
                  <Switch
                    size="small"
                    onChange={() => handleLayerClick(layer)}
                    checked={
                      (queryParameters.layers && !queryParameters.layer &&
                        queryParameters.layers[0]?.id === layer.id) ||
                      (queryParameters.layer &&
                        queryParameters.layer === layer.attributes.arcgislayerId)
                    }
                  />

                  <Typography
                    style={{
                      fontSize: '14px',
                      textAlign: 'left',
                      font: 'Inter',
                    }}
                  >
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
  )
}

export default Subcategories
