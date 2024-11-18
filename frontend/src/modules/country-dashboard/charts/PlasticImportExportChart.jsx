import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import useLayerInfo from '../../../hooks/useLayerInfo'

const PlasticImportExportChart = () => {
  const router = useRouter()
  const { country } = router.query
  const { layers, loading } = useLayerInfo()
  const [years, setYears] = useState([])
  const [totalImports, setTotalImports] = useState([])
  const [totalExports, setTotalExports] = useState([])

  useEffect(() => {
    const fetchData = () => {
      if (loading || !country || !layers.length) return

      const importLayer = layers?.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Total_plastic___value__import__WFL1'
      )
      const exportLayer = layers?.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Total_plastic___value__export__WFL1'
      )

      if (!importLayer || !exportLayer) {
        console.warn('Import or export layer not found.')
        return
      }

      const filteredImports = importLayer.attributes.ValuePerCountry?.filter(
        (item) => item.CountryName === country
      )

      const filteredExports = exportLayer.attributes.ValuePerCountry?.filter(
        (item) => item.CountryName === country
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
      text: `Plastic import & export value for ${country} `,
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold', color: '#020A5B' },
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
      nameTextStyle: {
        color: '#020A5B',
        fontSize: 12, 
      },
      name: 'million US dollars',
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
    <ReactEcharts
      option={getOption()}
      style={{ height: '400px', width: '100%' }}
    />
  )
}

export default PlasticImportExportChart
