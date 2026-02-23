import React from 'react'
import ReactEcharts from 'echarts-for-react'
import { t, Trans } from '@lingui/macro'
import { COLORS } from '../constants'

const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania']
const REGION_KEYS_A = [
  '__EMPTY_4',
  '__EMPTY_5',
  '__EMPTY_6',
  '__EMPTY_7',
  '__EMPTY_8',
]
const REGION_KEYS_B = [
  '__EMPTY_15',
  '__EMPTY_16',
  '__EMPTY_17',
  '__EMPTY_18',
  '__EMPTY_19',
]

const TradingPartnersBarChart = ({ countryData }) => {
  if (!countryData) return null

  const rows = countryData['UNCTAD$partners'] || []

  // Try __EMPTY_3/__EMPTY_4 format first, then __EMPTY_14/__EMPTY_15 format
  let importRow = rows.find(
    (r) =>
      r.__EMPTY_3 === 'Import of total plastics' &&
      typeof r.__EMPTY_4 === 'number'
  )
  let exportRow = rows.find(
    (r) =>
      r.__EMPTY_3 === 'Export of total plastics' &&
      typeof r.__EMPTY_4 === 'number'
  )

  let regionKeys = REGION_KEYS_A

  if (!importRow && !exportRow) {
    importRow = rows.find(
      (r) =>
        r.__EMPTY_14 === 'Import of total plastics' &&
        typeof r.__EMPTY_15 === 'number'
    )
    exportRow = rows.find(
      (r) =>
        r.__EMPTY_14 === 'Export of total plastics' &&
        typeof r.__EMPTY_15 === 'number'
    )
    regionKeys = REGION_KEYS_B
  }

  if (!importRow && !exportRow) return null

  const importValues = regionKeys.map((key) =>
    importRow && importRow[key] != null
      ? parseFloat(Number(importRow[key]).toFixed(1))
      : 0
  )
  const exportValues = regionKeys.map((key) =>
    exportRow && exportRow[key] != null
      ? parseFloat(Number(exportRow[key]).toFixed(1))
      : 0
  )

  const getOption = () => ({
    title: {
      text: t`Import and export of total plastics (2022)`,
      left: 'center',
      textStyle: {
        fontSize: window.innerWidth < 768 ? 14 : 18,
        fontWeight: 'normal',
        color: '#666',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let html = `${params[0].name}<br/>`
        params.forEach((p) => {
          html += `${p.marker} ${p.seriesName}: ${p.value?.toLocaleString()} ${t`million USD`}<br/>`
        })
        return html
      },
    },
    legend: {
      data: [t`Export of total plastics`, t`Import of total plastics`],
      top: 35,
      textStyle: { color: COLORS.PRIMARY_DARK_BLUE },
    },
    grid: {
      left: window.innerWidth < 768 ? '18%' : '10%',
      right: '4%',
      top: '20%',
      bottom: '12%',
    },
    xAxis: {
      type: 'category',
      data: REGIONS,
      axisLabel: { color: COLORS.PRIMARY_DARK_BLUE, fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      name: t`Value (million USD)`,
      nameTextStyle: { color: COLORS.PRIMARY_DARK_BLUE, fontSize: 12 },
      axisLabel: { color: COLORS.PRIMARY_DARK_BLUE, fontSize: 12 },
    },
    series: [
      {
        name: t`Import of total plastics`,
        type: 'bar',
        stack: 'total',
        data: importValues,
        itemStyle: { color: '#5BA8A0' },
        barMaxWidth: 60,
      },
      {
        name: t`Export of total plastics`,
        type: 'bar',
        stack: 'total',
        data: exportValues,
        itemStyle: { color: '#384E85' },
        barMaxWidth: 60,
      },
    ],
  })

  return (
    <div className="trading-partners-bar-chart">
      <ReactEcharts
        option={getOption()}
        style={{ height: '400px', width: '100%' }}
      />
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
          href="https://unctad.org/publication/global-trade-plastics-insights-first-life-cycle-trade-database"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: COLORS.PRIMARY_DARK_BLUE, fontWeight: 'bold' }}
        >
          UNCTAD 2023
        </a>
      </div>
    </div>
  )
}

export default TradingPartnersBarChart
