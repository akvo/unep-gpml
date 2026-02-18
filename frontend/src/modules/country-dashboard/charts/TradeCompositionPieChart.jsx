import React from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import { t, Trans } from '@lingui/macro'
import { splitIntoTwoLines } from '../utils'
import { COLORS } from '../constants'

const GROUP_COLORS = ['#1B3A5C', '#4DB8A4', '#5C8099']

const TradeCompositionPieChart = ({ countryData, type }) => {
  const router = useRouter()
  const { country } = router.query

  if (!countryData) return null

  const rows = countryData['WTO_pie'] || []

  // The WTO_pie sheet uses columns: "Imports" (group name) and "__EMPTY" (value).
  // Layout: rows 0 = import header, 1-3 = import data,
  //         row 4 = separator ("Exports"), row 5 = export header, 6-8 = export data,
  //         row 9+ = footer notes.
  // Find the separator row where Imports === "Exports" to split import/export sections.
  const separatorIdx = rows.findIndex(
    (r) => r.Imports && String(r.Imports).trim() === 'Exports'
  )

  let sectionRows
  if (separatorIdx === -1) {
    // Fallback: use all rows
    sectionRows = rows
  } else if (type === 'import') {
    sectionRows = rows.slice(0, separatorIdx)
  } else {
    sectionRows = rows.slice(separatorIdx + 1)
  }

  // Filter to data rows: must have a group name in "Imports" and a numeric value in "__EMPTY"
  const pieData = sectionRows
    .filter(
      (r) =>
        r.Imports &&
        r.__EMPTY != null &&
        typeof r.__EMPTY === 'number'
    )
    .map((r) => ({
      name: r.Imports,
      value: parseFloat(r.__EMPTY.toFixed(1)),
    }))

  if (pieData.length === 0) return null

  const countryName = decodeURIComponent(country)
  const titleText =
    type === 'import'
      ? t`Import composition for ${countryName}`
      : t`Export composition for ${countryName}`

  const getOption = () => ({
    title: {
      text: splitIntoTwoLines(titleText, true),
      subtext: t`By material group (million USD)`,
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
        `${params.name}<br/>${params.value.toLocaleString()} M$ (${params.percent}%)`,
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      data: pieData.map((d) => d.name),
      textStyle: { color: COLORS.PRIMARY_DARK_BLUE, fontSize: 11 },
    },
    color: GROUP_COLORS,
    series: [
      {
        name:
          type === 'import' ? t`Import composition` : t`Export composition`,
        type: 'pie',
        radius: ['35%', '65%'],
        top: '15%',
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
        style={{ height: typeof window !== 'undefined' && window.innerWidth < 768 ? '500px' : '400px', width: '100%' }}
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
          href="https://www.wto.org/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: COLORS.PRIMARY_DARK_BLUE, fontWeight: 'bold' }}
        >
          WTO 2023
        </a>
      </div>
    </div>
  )
}

export default TradeCompositionPieChart
