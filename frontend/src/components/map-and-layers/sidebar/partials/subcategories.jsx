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

  const handleSubcategoryChange = (key) => {
    setExpandedSubcategory(key)

    router.push(
      {
        pathname: router.pathname,
        query: { ...queryParameters, subcategoryId: key },
      },
      undefined,
      { shallow: true }
    )

    setQueryParameters({ subcategoryId: key })
  }

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

  if (loading) {
    return <div>Loading...</div>
  }

  let filteredLayers = layers.filter(
    (layer) => layer.attributes.subcategoryId === expandedSubcategory
  )

  const sortedLayers = filteredLayers
    .slice()
    .sort((a, b) => a.attributes.title.localeCompare(b.attributes.title))

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
        {subcategories?.subcategories?.data?.map((subcategory, index) => (
          <Panel
            key={subcategory.attributes.subcategoryId}
            header={subcategory.attributes.subcategoryName}
          >
            {sortedLayers.map((layer, layerIndex) => (
              <div
                className="layer-item"
                key={`${subcategory.attributes.subcategoryId}-${layerIndex}`}
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
                  overlayStyle={{ maxWidth: '600px', width: 'auto' }}
                  overlay={
                    <LayerInfo
                      layer={filteredLayers?.find(
                        (layerInfoItem) =>
                          layerInfoItem.arcgislayerId === layer.arcgislayerId &&
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
