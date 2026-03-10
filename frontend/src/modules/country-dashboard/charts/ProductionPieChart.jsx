import React from 'react'
import ReactEcharts from 'echarts-for-react'
import { Trans } from '@lingui/macro'
import { COLORS } from '../constants'

const CHART_COLORS = [
  '#005B96', '#E87722', '#2E8B57', '#4682B4', '#8B4513',
  '#6B8E23', '#2F4F4F', '#800020', '#556B2F', '#8B008B',
  '#483D8B', '#008080',
]

const ProductionPieChart = ({ chartData, chartTitle, chartSource, chartSourceUrl }) => {
  if (!chartData || chartData.length === 0) return null

  const getOption = () => ({
    title: {
      text: chartTitle,
      left: 'center',
      bottom: 0,
      textStyle: {
        fontSize: window.innerWidth < 768 ? 14 : 18,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_DARK_BLUE,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {d}%',
    },
    legend: {
      orient: 'horizontal',
      bottom: '12%',
      left: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12,
        color: COLORS.PRIMARY_DARK_BLUE,
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['0%', '65%'],
        center: ['50%', '40%'],
        data: chartData.map((item, i) => ({
          ...item,
          itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
        })),
        label: {
          show: true,
          formatter: '{d}%',
          fontSize: 12,
          color: COLORS.PRIMARY_DARK_BLUE,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  })

  return (
    <div>
      <ReactEcharts
        option={getOption()}
        style={{ height: '500px', width: '100%' }}
      />
      {chartSource && (
        <div
          style={{
            textAlign: 'left',
            padding: '10px',
            color: COLORS.PRIMARY_DARK_BLUE,
            fontSize: '12px',
          }}
        >
          <Trans>Data source: </Trans>{' '}
          <a
            href={chartSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.PRIMARY_DARK_BLUE, fontWeight: 'bold' }}
          >
            {chartSource}
          </a>
        </div>
      )}
    </div>
  )
}

export default ProductionPieChart
