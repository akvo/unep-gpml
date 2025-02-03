import React, { useEffect, useState } from 'react'
import Card from 'antd/lib/card/Card'
import Typography from 'antd/lib/typography/Typography'
import { Tooltip } from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'
import LayerInfo from '../sidebar/partials/layerInfo'
import useQueryParameters from '../../../hooks/useQueryParameters'
import useIndicators from '../../../hooks/useIndicators'
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
  hideNoData,
}) => {
  const [tooltipPlacement, setTooltipPlacement] = useState('right')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const legends = useLegends(layerId, arcgisMapId, layerMappingId)
  const mapp = useLoadMap(selectedLayers)
  const layers = useIndicators()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

    const allLegendItems = classBreakInfos
      ? !hideNoData
        ? [noDataLegendItem, ...classBreakInfos]
        : [...classBreakInfos]
      : !hideNoData
      ? [noDataLegendItem]
      : []

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr',
          gap: '6px',
        }}
      >
        {allLegendItems?.map(({ label, symbol }) => {
          let colorStyle
          if (Array.isArray(symbol?.color) && !symbol?.data?.symbol) {
            colorStyle = `rgba(${symbol?.color.join(', ')})`
          } else if (symbol?.data?.symbol) {
            colorStyle = `rgba(${symbol?.data.symbol.symbolLayers[1].color[0]}, ${symbol?.data.symbol.symbolLayers[1].color[1]}, ${symbol?.data.symbol?.symbolLayers[1].color[2]}, ${symbol?.data.symbol?.symbolLayers[1].color[3]})`
          } else if (
            typeof symbol?.color === 'object' &&
            symbol.color !== null
          ) {
            colorStyle = `rgba(${symbol?.color.r}, ${symbol?.color.g}, ${symbol?.color.b}, ${symbol?.color.a})`
          } else {
            console.warn(`Unexpected color format for label: ${label}`)
            return null
          }

          return (
            <div
              key={label}
              style={{
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
              <Typography
                style={{ color: '#09334B', variant: 'typography/body2' }}
              >
                {label}
              </Typography>
            </div>
          )
        })}
      </div>
    )
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
        style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}
      >
        {title}
      </Typography>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Typography style={{ fontSize: '14px', paddingBottom: '5px' }}>
          Unit: [{unit}]
        </Typography>
        {layerId && (
          <Tooltip
            placement={tooltipPlacement}
            overlay={
              <LayerInfo
                layer={layers?.layers?.find(
                  (layerInfoItem) =>
                    layerInfoItem.attributes.arcgislayerId === layerId &&
                    uniqueId === layerInfoItem.id
                )}
              />
            }
            overlayInnerStyle={{
              backgroundColor: 'white',
              width: 'auto',
              height: 'auto',
            }}
          >
            <InfoCircleFilled
              style={{ color: 'rgba(0, 0, 0, 0.45)' }}
              onClick={() => null}
            />
          </Tooltip>
        )}
      </div>
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
    </Card>
  )
}

const Legends = () => {
  const { queryParameters } = useQueryParameters()

  const allLayers = useIndicators()

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
      hideNoData={layer.attributes.HideNoData}
    />
  ))
}

export default Legends
