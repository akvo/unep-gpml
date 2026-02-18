import React from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import { t, Trans } from '@lingui/macro'
import { splitIntoTwoLines } from '../utils'
import { COLORS } from '../constants'

const TotalPlasticsTradeChart = ({ countryData }) => {
  const router = useRouter()
  const { country } = router.query

  if (!countryData) return null

  const rows = countryData['UNCTAD$value'] || []
  const importRow = rows.find(
    (r) =>
      r.Indicator &&
      r.Indicator.toLowerCase().includes('import of total plastics')
  )
  const exportRow = rows.find(
    (r) =>
      r.Indicator &&
      r.Indicator.toLowerCase().includes('export of total plastics')
  )

  if (!importRow && !exportRow) return null

  const sourceRow = importRow || exportRow
  const years = Object.keys(sourceRow)
    .filter((k) => k !== 'Indicator' && !isNaN(k))
    .sort()

  const importValues = years.map((y) =>
    importRow && importRow[y] != null
      ? parseFloat((importRow[y] / 1000).toFixed(1))
      : 0
  )
  const exportValues = years.map((y) =>
    exportRow && exportRow[y] != null
      ? parseFloat((exportRow[y] / 1000).toFixed(1))
      : 0
  )

  const countryName = decodeURIComponent(country)

  const getOption = () => ({
    title: {
      text: splitIntoTwoLines(
        t`Import and export of total plastics for ${countryName}`
      ),
      left: 'center',
      textStyle: {
        fontSize: window.innerWidth < 768 ? 14 : 18,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_DARK_BLUE,
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
    grid: {
      left: window.innerWidth < 768 ? '18%' : '10%',
      right: '4%',
      top: window.innerWidth < 768 ? '25%' : '20%',
      bottom: '15%',
    },
    legend: {
      data: [t`Imports`, t`Exports`],
      bottom: 0,
      textStyle: { color: COLORS.PRIMARY_DARK_BLUE },
    },
    xAxis: {
      type: 'category',
      data: years,
      axisLabel: { color: COLORS.PRIMARY_DARK_BLUE, fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      name: t`million USD`,
      nameTextStyle: { color: COLORS.PRIMARY_DARK_BLUE, fontSize: 12 },
      axisLabel: { color: COLORS.PRIMARY_DARK_BLUE, fontSize: 12 },
    },
    series: [
      {
        name: t`Imports`,
        type: 'bar',
        data: importValues,
        itemStyle: { color: '#6236FF' },
        barMaxWidth: 30,
      },
      {
        name: t`Exports`,
        type: 'bar',
        data: exportValues,
        itemStyle: { color: '#00BCD4' },
        barMaxWidth: 30,
      },
    ],
  })

  return (
    <div style={{ position: 'relative' }}>
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

export default TotalPlasticsTradeChart
