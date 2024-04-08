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

const LegendCard = ({
  layerId,
  title,
  arcgismapId,
  layerShortDescription,
  unit,
}) => {
  const [tooltipPlacement, setTooltipPlacement] = useState('right')
  const legends = useLegends(layerId)
  const mapp = useLoadMap()
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
    return classBreakInfos?.map(({ label, symbol }) => {
      let colorStyle
      if (Array.isArray(symbol.color) && !symbol?.data?.symbol) {
        colorStyle = `rgba(${symbol.color.join(', ')})`
      } else if (symbol?.data?.symbol) {
        colorStyle = `rgba(${symbol.data.symbol.symbolLayers[1].color[0]}, ${symbol.data.symbol.symbolLayers[1].color[1]}, ${symbol.data.symbol.symbolLayers[1].color[2]}, ${symbol.data.symbol.symbolLayers[1].color[3]})`
      } else if (typeof symbol.color === 'object' && symbol.color !== null) {
        colorStyle = `rgba(${symbol.color.r}, ${symbol.color.g}, ${symbol.color.b}, ${symbol.color.a})`
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
        UNIT: [{unit}]
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

      {arcgismapId
        ? rendererObj && renderLegendItems(rendererObj.classBreakInfos)
        : legends?.legends?.drawingInfo?.renderer?.classBreakInfos &&
          renderLegendItems(
            legends.legends.drawingInfo.renderer.classBreakInfos
          )}

      {layerId && (
        <Tooltip
          placement={tooltipPlacement}
          overlayStyle={{ maxWidth: '500px', width: 'auto' }}
          overlay={
            <LayerInfo
              layer={layers?.layers?.find(
                (layerInfoItem) =>
                  layerInfoItem.attributes.arcgislayerId === layerId
              )}
            ></LayerInfo>
          }
          overlayInnerStyle={{ backgroundColor: 'white', width: 'auto', height: 'auto' }}
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

  return queryParameters?.layers?.map((layer, index) => (
    <LegendCard
      key={index}
      layerId={layer?.attributes.arcgislayerId}
      title={layer?.attributes.title.toString()}
      arcgismapId={layer.attributes.arcgisMapId}
      layerShortDescription={layer.attributes.shortDescription}
      unit={layer.attributes.units}
    />
  ))
}

export default Legends
