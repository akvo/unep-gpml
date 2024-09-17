import React, { useEffect, useState } from 'react'
import Card from 'antd/lib/card/Card'
import Typography from 'antd/lib/typography/Typography'
import { Tooltip } from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'
import LayerInfo from '../sidebar/partials/layerInfo'
import useQueryParameters from '../../../hooks/useQueryParameters'
import useLayerInfo from '../../../hooks/useLayerInfo'
import useLoadMap from '../../../hooks/useLoadMap'
import useLegends from '../../../hooks/useLegends'
import { transformObjectToArray } from '../../../utils/form-utils'

const LegendCard = ({
  layerId,
  title,
  arcgisMapId,
  layerMappingId,
  uniqueId,
  layerShortDescription,
  unit,
  selectedLayers,
}) => {
  const [tooltipPlacement, setTooltipPlacement] = useState('right')
  const legends = useLegends(layerId, arcgisMapId, layerMappingId)
  const mapp = useLoadMap(selectedLayers)
  const layers = useLayerInfo()

  const rendererObj = mapp.renderers.find((r) =>
    r.key.trim() === 'Threat to Reefs'
      ? title.trim()
      : 'Mismanaged plastic waste (MPW) from the ocean reaching the national coasts'
  )?.renderer

  const updateTooltipPlacement = () => {
    const mapContainer = document.getElementById('mapContainer')
    if (mapContainer) {
      const mapRect = mapContainer.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const spaceLeft = mapRect.left
      const spaceRight = windowWidth - mapRect.right
      if (spaceLeft > spaceRight) {
        setTooltipPlacement('left')
      } else {
        setTooltipPlacement('right')
      }
    }
  }

  useEffect(() => {
    updateTooltipPlacement()
    window.addEventListener('resize', updateTooltipPlacement)
    return () => window.removeEventListener('resize', updateTooltipPlacement)
  }, [])

  const renderLegendItems = (classBreakInfos) => {
    const noDataLegendItem = {
      label: 'No Data',
      symbol: {
        color: [255, 255, 255, 1],
        border: '1px solid black',
      },
    }
    const hideNoData = [
      '33f138dc9da943fbb0d9905267d5ce8e',
      'c480f87fa33a4264b5aac7739dd93af6',
      'ba06282496e548a1adbdff5df17e770e',
      '5432cebd4d8f416487b6f90ddf532068',
      '2d6805cc5ea2493689656902d26f1ea6',
      'f4e666cb317a4087baa382f908314bd3',
      '9ad32b018256498985a7e09393b349d9',
      '3c59a0aa4eda462fb7f91a753d6fa621',
    ]

    const allLegendItems = classBreakInfos
      ? !hideNoData.find((l) => l === arcgisMapId)
        ? [noDataLegendItem, ...classBreakInfos]
        : [...classBreakInfos]
      : !hideNoData.find((l) => l === arcgisMapId)
      ? [noDataLegendItem]
      : []
    return allLegendItems?.map(({ label, symbol }) => {
      let colorStyle
      if (Array.isArray(symbol?.color) && !symbol?.data?.symbol) {
        colorStyle = `rgba(${symbol?.color.join(', ')})`
      } else if (symbol?.data?.symbol) {
        colorStyle = `rgba(${symbol?.data.symbol.symbolLayers[1].color[0]}, ${symbol?.data.symbol.symbolLayers[1].color[1]}, ${symbol?.data.symbol?.symbolLayers[1].color[2]}, ${symbol?.data.symbol?.symbolLayers[1].color[3]})`
      } else if (typeof symbol?.color === 'object' && symbol.color !== null) {
        colorStyle = `rgba(${symbol?.color.r}, ${symbol?.color.g}, ${symbol?.color.b}, ${symbol?.color.a})`
      } else {
        console.warn(`Unexpected color format for label: ${label}`)
        return null
      }

      return (
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: colorStyle,
              border: '1px solid gray',
              marginRight: '6px',
              borderRadius: '2px',
            }}
          ></div>
          <Typography style={{ color: '#09334B', variant: 'typography/body2' }}>
            {label}
          </Typography>
        </div>
      )
    })
  }

  return (
    <Card
      bordered={false}
      style={{
        width: '100%',
        borderRadius: '8px',
        border: 'none',
      }}
    >
      <Typography
        level={5}
        style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      >
        {title}
      </Typography>
      <Typography style={{ fontSize: '14px', paddingBottom: '5px' }}>
        Unit: [{unit}]
      </Typography>

      <Typography
        style={{
          fontSize: '12px',
          wordWrap: 'break-word',
          width: '80%',
          color: '#09334B',
          variant: 'typography/body2',
          paddingBottom: '3px',
        }}
      >
        {layerShortDescription}
      </Typography>

      {arcgisMapId && layerMappingId !== null
        ? rendererObj &&
          renderLegendItems(
            rendererObj?.classBreakInfos
              ? rendererObj?.classBreakInfos
              : rendererObj?.uniqueValueGroups
              ? rendererObj?.uniqueValueGroups[0]?.classes
              : []
          )
        : renderLegendItems(
            legends?.legends?.drawingInfo?.renderer
              ? legends?.legends?.drawingInfo?.renderer?.classBreakInfos
              : mapp?.renderers[0]?.renderer?.renderer?.classBreakInfos ||
                  transformObjectToArray(
                    mapp?.renderers[0]?.renderer?.renderer?._valueInfoMap
                  )
          )}

      {layerId && (
        <Tooltip
          placement={tooltipPlacement}
          overlayStyle={{ maxWidth: '500px', width: 'auto' }}
          overlay={
            <LayerInfo
              layer={layers?.layers?.find(
                (layerInfoItem) =>
                  layerInfoItem.attributes.arcgislayerId === layerId &&
                  uniqueId === layerInfoItem.id
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
      )}
    </Card>
  )
}

const Legends = () => {
  const { queryParameters } = useQueryParameters()

  const allLayers = useLayerInfo()

  const layers = queryParameters?.layer
    ? allLayers?.layers?.filter(
        (layer) => layer.attributes.arcgislayerId == queryParameters.layer
      )
    : queryParameters?.layers

  return layers?.map((layer, index) => (
    <LegendCard
      key={index}
      layerId={layer?.attributes.arcgislayerId}
      uniqueId={layer?.id}
      title={layer?.attributes.title.toString()}
      arcgisMapId={layer.attributes.arcgisMapId}
      layerMappingId={layer.attributes.layerMappingId}
      layerShortDescription={layer.attributes.shortDescription}
      unit={layer.attributes.units}
      selectedLayers={layers}
    />
  ))
}

export default Legends
