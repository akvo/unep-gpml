import { Typography, Collapse, Switch } from 'antd'
// import styled from "styled-components";
import React, { useState, useEffect } from 'react'
import useIndicators from '../../../../hooks/useIndicators'
import useQueryParameters from '../../../../hooks/useQueryParameters'
import { Tooltip } from 'antd'

import { InfoCircleFilled } from '@ant-design/icons'
import LayerInfo from './layerInfo'
import useLayerInfo from '../../../../hooks/useLayerInfo'
import { useRouter } from 'next/router'
import classNames from 'classnames'
// const LayersContainer = styled.div`
//   padding-left: 0;
//   background-color: white;
//   width: 80%;
//   height: 100%;
//   border-right: 2px solid #717d96;
//   padding-top: 35px;
//   overflow: auto;
// `;

const { Panel } = Collapse

// const LayerItem = styled.div`
//   display: grid;
//   grid-template-columns: auto 1fr auto;
//   align-items: center;
//   gap: 8px;
//   padding-bottom: 8px;
// `;

const Subcategories = ({ subcategories }) => {
  const {
    queryParameters,
    setQueryParameters,
    createQueryParametersString,
  } = useQueryParameters()

  const [expandedSubcategory, setExpandedSubcategory] = useState(null)
  const [hoveredLayerId, setHoveredLayerId] = useState(null)

  const router = useRouter()

  useEffect(() => {
    if (router.query.subcategoryId !== expandedSubcategory) {
      setExpandedSubcategory(router.query.subcategoryId || null)
    }
  }, [router.query.subcategoryId])

  const handleMouseEnter = (layerId) => {
    setHoveredLayerId(layerId)
  }

  const handleMouseLeave = () => {
    setHoveredLayerId(null)
  }

  const layerInfo = useLayerInfo()

  useEffect(() => {
    const layersParam = queryParameters.layers
    if (layersParam) {
      const selectedLayers = Array.isArray(layersParam)
        ? layersParam
        : layersParam.split(',')
      setQueryParameters({ layers: selectedLayers })
    }
  }, [])

  const handleSubcategoryClick = (subcategory) => {
    const newSubcategoryId =
      expandedSubcategory === subcategory.attributes.subcategoryId
        ? null
        : subcategory.attributes.subcategoryId
    setExpandedSubcategory(newSubcategoryId)

    router.push(
      {
        pathname: router.pathname,
        query: { ...queryParameters, subcategoryId: newSubcategoryId },
      },
      undefined,
      { shallow: true }
    )

    setQueryParameters({ subcategoryId: newSubcategoryId })
  }
  const layers = useIndicators(expandedSubcategory)

  const handleLayerClick = (layer) => {
    let updatedLayers = []

    if (
      queryParameters.layers[0]?.arcgislayerId ===
        layer.attributes.arcgislayerId &&
      layer.attributes.arcgislayerId !== null &&
      queryParameters.layers[0]?.id === layer.id
    ) {
      updatedLayers = []
      setQueryParameters({ layers: [] })
    } else {
      updatedLayers = [layer]
      setQueryParameters({ layers: [layer] })
    }

    setQueryParameters({ layers: updatedLayers })
  }

  const sortedLayers = layers.layers
    .slice()
    .sort((a, b) => a.attributes.title.localeCompare(b.attributes.title))

  return (
    <div>
      <Collapse accordion ghost expandIconPosition="right" destroyInactivePanel>
        {subcategories?.subcategories?.data.map((subcategory, index) => (
          <Panel
            key={subcategory.attributes.subcategoryId}
            header={
              <div onClick={() => handleSubcategoryClick(subcategory)}>
                {subcategory.attributes.subcategoryName}
              </div>
            }
          >
            {sortedLayers.map((layer, layerIndex) => (
              <div
                className="layer-item"
                key={`${subcategory.attributes.subcategoryId}-${layerIndex}`}
                onMouseEnter={() => handleMouseEnter(layer.id)}
                onMouseLeave={handleMouseLeave}
              >
                <Switch
                  size="small"
                  onChange={() => handleLayerClick(layer)}
                  checked={queryParameters.layers[0]?.id === layer.id}
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
                  style={{ backgroundColor: 'white' }}
                  title={
                    <LayerInfo
                      layer={layerInfo.layers?.data?.find(
                        (layerInfoItem) =>
                          layerInfoItem.arcgislayerId === layer.arcgislayerId
                      )}
                    ></LayerInfo>
                  }
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
