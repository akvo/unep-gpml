import React from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import { t, Trans } from '@lingui/macro'
import { splitIntoTwoLines } from '../utils'
import { COLORS } from '../constants'

const REGION_COLORS = {
  Africa: '#A3D5CE',
  Americas: '#4DB8A4',
  Asia: '#020A5B',
  Europe: '#2E4A7A',
  Oceania: '#7ECBC2',
}

const TradingPartnersPieChart = ({ countryData, type }) => {
  const router = useRouter()
  const { country } = router.query

  if (!countryData) return null

  const rows = countryData['UNCTAD$partners'] || []
  const indicator =
    type === 'import' ? 'Import of total plastics' : 'Export of total plastics'

  const partnerRows = rows.filter(
    (r) => r.Indicator === indicator && r['Trading partner']
  )

  // Get the latest year column
  const yearColumns = Object.keys(partnerRows[0] || {})
    .filter((k) => k !== 'Indicator' && k !== 'Trading partner' && !isNaN(k))
    .sort()

  const latestYear = yearColumns[yearColumns.length - 1]

  const pieData = partnerRows
    .map((r) => ({
      name: r['Trading partner'],
      value: r[latestYear] || 0,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const countryName = decodeURIComponent(country)
  const titleText =
    type === 'import'
      ? t`Plastic import sources for ${countryName}`
      : t`Plastic export destinations for ${countryName}`

  const getOption = () => ({
    title: {
      text: splitIntoTwoLines(titleText, true),
      subtext: t`By region, ${latestYear} (million USD)`,
      left: 'center',
      textStyle: {
        fontSize: window.innerWidth < 768 ? 14 : 18,
        color: COLORS.PRIMARY_DARK_BLUE,
      },
      subtextStyle: {
        fontSize: 14,
        color: COLORS.PRIMARY_DARK_BLUE,
        fontFamily: 'Roboto, Helvetica Neue, sans-serif',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) =>
        `${params.name}: ${Math.round(params.value).toLocaleString()} M$ (${params.percent}%)`,
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      data: pieData.map((d) => d.name),
      textStyle: { color: COLORS.PRIMARY_DARK_BLUE },
    },
    color: pieData.map((d) => REGION_COLORS[d.name] || '#999'),
    series: [
      {
        name: type === 'import' ? t`Import sources` : t`Export destinations`,
        type: 'pie',
        radius: ['35%', '65%'],
        top: '15%',
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{d}%',
          fontSize: 12,
          color: '#fff',
        },
        labelLine: { show: false },
        data: pieData,
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

export default TradingPartnersPieChart
