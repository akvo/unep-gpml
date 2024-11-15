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
      text: `Plastic Import & Export Value for ${country} `,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['Total exports', 'Total imports'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: years,
    },
    yAxis: {
      type: 'value',
      name: 'million US dollars',
    },
    series: [
      {
        name: 'Total exports',
        type: 'line',
        data: totalExports,
        symbol: 'circle',
        itemStyle: {
          color: '#384E85',
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
