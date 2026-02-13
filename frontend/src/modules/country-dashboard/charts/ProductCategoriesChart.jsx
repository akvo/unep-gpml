import React from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import { t, Trans } from '@lingui/macro'
import { splitIntoTwoLines } from '../utils'
import { COLORS } from '../constants'

const ProductCategoriesChart = ({ countryData }) => {
  const router = useRouter()
  const { country } = router.query

  if (!countryData) return null

  const rows = countryData['UNCTAD$products'] || []

  const categories = [
    { key: 'plastic packaging', label: t`Plastic packaging` },
    { key: 'synthetic textiles', label: t`Synthetic textiles` },
    { key: 'synthetic rubber', label: t`Synthetic rubber` },
  ]

  // Get the latest year
  const sampleRow = rows[0] || {}
  const yearColumns = Object.keys(sampleRow)
    .filter((k) => k !== 'Indicator' && !isNaN(k))
    .sort()
  const latestYear = yearColumns[yearColumns.length - 1]

  const getValueForCategory = (keyword, type) => {
    const row = rows.find(
      (r) =>
        r.Indicator &&
        r.Indicator.toLowerCase().includes(keyword) &&
        r.Indicator.toLowerCase().includes(type)
    )
    return row ? (row[latestYear] || 0) / 1000 : 0 // Convert to millions
  }

  const importData = categories.map((c) =>
    parseFloat(getValueForCategory(c.key, 'import').toFixed(1))
  )
  const exportData = categories.map((c) =>
    parseFloat(getValueForCategory(c.key, 'export').toFixed(1))
  )

  const countryName = decodeURIComponent(country)

  const getOption = () => ({
    title: {
      text: splitIntoTwoLines(
        t`Product categories trade for ${countryName}`
      ),
      subtext: t`In million USD, ${latestYear}`,
      left: 'center',
      textStyle: {
        fontSize: window.innerWidth < 768 ? 14 : 18,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_DARK_BLUE,
      },
      subtextStyle: {
        fontSize: 14,
        color: COLORS.PRIMARY_DARK_BLUE,
        fontFamily: 'Roboto, Helvetica Neue, sans-serif',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: [t`Import`, t`Export`],
      bottom: 0,
      textStyle: { color: COLORS.PRIMARY_DARK_BLUE },
    },
    grid: {
      left: '3%',
      right: '4%',
      top: window.innerWidth < 768 ? 100 : 80,
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories.map((c) => c.label),
      axisLabel: {
        color: COLORS.PRIMARY_DARK_BLUE,
        fontSize: window.innerWidth < 768 ? 10 : 12,
        width: 80,
        overflow: 'break',
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: t`million USD`,
      nameTextStyle: { color: COLORS.PRIMARY_DARK_BLUE, fontSize: 12 },
      axisLabel: { color: COLORS.PRIMARY_DARK_BLUE, fontSize: 12 },
    },
    series: [
      {
        name: t`Import`,
        type: 'bar',
        data: importData,
        itemStyle: { color: COLORS.ACCENT_YELLOW },
        barGap: '10%',
      },
      {
        name: t`Export`,
        type: 'bar',
        data: exportData,
        itemStyle: { color: COLORS.PRIMARY_DARK_BLUE },
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

export default ProductCategoriesChart
