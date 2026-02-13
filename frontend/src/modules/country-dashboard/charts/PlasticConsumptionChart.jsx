import React from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import { t, Trans } from '@lingui/macro'
import { splitIntoTwoLines } from '../utils'
import { COLORS } from '../constants'

const PlasticConsumptionChart = ({ countryData }) => {
  const router = useRouter()
  const { country } = router.query

  if (!countryData) return null

  const rows = countryData['UNCTAD$value'] || []
  const consumptionRow = rows.find(
    (r) =>
      r.Indicator &&
      r.Indicator.toLowerCase().includes('apparent plastic consumption')
  )

  if (!consumptionRow) return null

  const years = Object.keys(consumptionRow)
    .filter((k) => k !== 'Indicator' && !isNaN(k))
    .sort()

  const values = years.map((y) => consumptionRow[y])
  const countryName = decodeURIComponent(country)

  const getOption = () => ({
    title: {
      text: splitIntoTwoLines(
        t`Apparent plastic consumption for ${countryName}`
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
        const p = params[0]
        return `${p.name}<br/>${p.marker} ${p.seriesName}: ${p.value?.toFixed(1)} ${t`million USD`}`
      },
    },
    grid: {
      left: window.innerWidth < 768 ? '18%' : '10%',
      right: '4%',
      top: window.innerWidth < 768 ? '25%' : '20%',
      bottom: '15%',
    },
    legend: {
      data: [t`Apparent consumption`],
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
        name: t`Apparent consumption`,
        type: 'bar',
        data: values,
        itemStyle: { color: '#4DB8A4' },
        barMaxWidth: 40,
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

export default PlasticConsumptionChart
