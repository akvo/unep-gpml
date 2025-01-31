import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import { getBaseUrl } from '../../../utils/misc'

const PlasticImportExportChart = ({ layers, loading }) => {
  const router = useRouter()
  const baseURL = getBaseUrl()
  const { country, countryCode } = router.query
  const [years, setYears] = useState([])
  const [totalImports, setTotalImports] = useState([])
  const [totalExports, setTotalExports] = useState([])

  useEffect(() => {
    const fetchData = () => {
      if (loading || !country || !layers.length) return

      const importLayer = layers?.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Total_plastic___value__import__V2_WFL1'
      )
      const exportLayer = layers?.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Total_plastic___value__export__V2_WFL1'
      )

      if (!importLayer || !exportLayer) {
        console.warn('Import or export layer not found.')
        return
      }

      const filteredImports = importLayer.attributes.ValuePerCountry?.filter(
        (item) =>
          item.CountryCode
            ? item.CountryCode === countryCode
            : item.CountryName === decodeURIComponent(country)
      )

      const filteredExports = exportLayer.attributes.ValuePerCountry?.filter(
        (item) =>
          item.CountryCode
            ? item.CountryCode === countryCode
            : item.CountryName === decodeURIComponent(country)
      )

      const yearsSet = new Set()
      const importValues = []
      const exportValues = []

      filteredImports?.forEach((item) => {
        yearsSet.add(item.Year)
        importValues.push(item.Value)
      })

      filteredExports?.forEach((item) => {
        exportValues.push(item.Value)
      })

      setYears(Array.from(yearsSet).sort())
      setTotalImports(importValues)
      setTotalExports(exportValues)
    }

    fetchData()
  }, [country, layers, loading])

  const getOption = () => ({
    title: {
      text:
        window.innerWidth < 768
          ? `Plastic import & export value\nfor ${decodeURIComponent(country)}`
          : `Plastic import & export value for ${decodeURIComponent(country)}`,
      left: 'center',
      textStyle: {
        fontSize: window.innerWidth < 768 ? 14 : 18,
        fontWeight: 'bold',
        color: '#020A5B',
        wordWrap: 'break-word',
        overflow: 'break',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['Total exports', 'Total imports'],
      textStyle: { color: '#020A5B' },
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      textStyle: { color: '#020A5B' },
      data: years,
      axisLabel: {
        formatter: '{value} ',
        fontSize: 12,
        color: '#020A5B',
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} ',
        fontSize: 12,
        color: '#020A5B',
      },
      name: 'million US dollars',
      nameTextStyle: {
        color: '#020A5B',
        fontSize: 12,
      },
    },
    series: [
      {
        name: 'Total exports',
        type: 'line',
        data: totalExports,
        symbol: 'circle',
        itemStyle: {
          color: '#020A5B',
        },
      },
      {
        name: 'Total imports',
        type: 'line',
        data: totalImports,
        symbol: 'circle',
        itemStyle: {
          color: '#FFB800',
        },
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
          color: '#020A5B',
          fontSize: '12px',
        }}
      >
        Data source:{' '}
        <a
          href={`${baseURL}/data/maps?categoryId=industry-and-trade&subcategoryId=Import&layer=Plastic_waste___value__import__WFL1`}
          style={{ color: '#020A5B', fontWeight: 'bold' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          UNCTAD 2021
        </a>{' '}
      </div>
    </div>
  )
}

export default PlasticImportExportChart
