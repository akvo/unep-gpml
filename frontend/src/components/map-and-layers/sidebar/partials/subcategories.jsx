import { Typography, Collapse, Switch } from 'antd'
import React, { useState, useEffect } from 'react'
import useIndicators from '../../../../../../hooks/useIndicators'
import useQueryParameters from '../../../../../../hooks/useQueryParameters'
import Tooltip from 'antd/es/tooltip'
import { InfoCircleFilled } from '@ant-design/icons'

import useLayerInfo from '../../../../../../hooks/useLayerInfo'
import LayerInfo from './LayerInfo'
import { useRouter } from 'next/router'
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
  const router = useRouter()
  const { query } = router
  const { categoryId, subcategoryId } = router.query
  const layers = useIndicators(subcategoryId)

  const {
    queryParameters,
    setQueryParameters,
    createQueryParametersString,
  } = useQueryParameters()

  const [expandedSubcategory, setExpandedSubcategory] = useState(null)
  const [hoveredLayerId, setHoveredLayerId] = useState(null)

  const handleMouseEnter = (layerId) => {
    setHoveredLayerId(layerId)
  }

  const handleMouseLeave = () => {
    setHoveredLayerId(null)
  }

  const layerInfo = useLayerInfo()

  useEffect(() => {
    const layersParam = query.layers
    if (layersParam) {
      const selectedLayers = Array.isArray(layersParam)
        ? layersParam
        : layersParam.split(',')
      setQueryParameters({ layers: selectedLayers })
    }
  }, [query.layers, setQueryParameters])

  const handleSubcategoryClick = (subcategory) => {
    const newSubcategoryId =
      expandedSubcategory === subcategory.attributes.subcategoryId
        ? null
        : subcategory.attributes.subcategoryId
    setExpandedSubcategory(subcategory.attributes.subcategoryId)

    if (newSubcategoryId) {
      const queryParametersString = createQueryParametersString({
        sidebar: 'show',
        layers: queryParameters.layers,
      })

      // navigate({
      //   pathname: `/maps-and-layers/${categoryId}/${subcategory.attributes.subcategoryId}`,
      //   search: queryParametersString,
      // })
    }
  }

  const handleLayerClick = (layer) => {
    let updatedLayers

    if (
      queryParameters.layers[0]?.arcgislayerId ===
        layer.attributes.arcgislayerId &&
      layer.attributes.arcgislayerId !== null &&
      queryParameters.layers[0]?.id === layer.id
    ) {
      updatedLayers = []
      setQueryParameters({
        layers: [],
      })
    } else {
      updatedLayers = [layer]

      setQueryParameters({
        layers: [layer],
      })
    }

    const queryParametersString = createQueryParametersString({
      sidebar: 'show',
      layers: updatedLayers,
    })
    setQueryParameters({ layers: updatedLayers })
    // navigate({ search: queryParametersString })
  }

  const sortedLayers = layers.layers
    .slice()
    .sort((a, b) => a.attributes.title.localeCompare(b.attributes.title))

  return (
    <div>
      <Collapse accordion ghost expandIconPosition="right">
        {subcategories.subcategories.data.map((subcategory, index) => (
          <Panel
            key={subcategory.attributes.subcategoryId}
            header={
              <Typography
                style={{
                  fontSize: '14px',
                  font: 'inter',
                  color: '#2D3648',
                  variant: 'typography/body2',
                  fontWeight:
                    expandedSubcategory === subcategory.attributes.subcategoryId
                      ? 'bold'
                      : 'normal',
                }}
              >
                {subcategory.attributes.subcategoryName}
              </Typography>
            }
            onClick={() => handleSubcategoryClick(subcategory)}
          >
            {sortedLayers.map((layer, layerIndex) => (
              <div
                key={`${subcategory.attributes.subcategoryId}-${layerIndex}`}
                onMouseEnter={() => handleMouseEnter(layer.id)}
                onMouseLeave={handleMouseLeave}
              >
                <Switch
                  size="small"
                  onChange={() => handleLayerClick(layer)}
                  checked={queryParameters.layers[0]?.id === layer.id}
                  style={{
                    transform: 'scale(0.8)',
                    backgroundColor:
                      queryParameters.layers[0]?.arcgislayerId ===
                        layer.attributes.arcgislayerId &&
                      (queryParameters.layers[0]?.layerMappingId
                        ? queryParameters.layers[0]?.layerMappingId ===
                          layer.attributes.layerMappingId
                        : true)
                        ? '#2D3648'
                        : '#d9d9d9',
                  }}
                  trackHeight="1px"
                  trackMinWidth="1px"
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
                      layer={layerInfo.layers?.results?.find(
                        (layerInfoItem) => layerInfoItem.id === layer.id
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
