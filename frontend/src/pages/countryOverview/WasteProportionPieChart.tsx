import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import useLayerInfo from '../../hooks/useLayerInfo'

const WasteProportionBarChart = () => {
  const router = useRouter()
  const { country } = router.query
  const { layers, loading } = useLayerInfo()

  const [recycledData, setRecycledData] = useState(0)

  useEffect(() => {
    const fetchData = () => {
      if (loading || !country || !layers.length) return

      const recycledLayer = layers.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Proportion_of_municipal_waste_recycled_13_10_24_WFL1'
      )

      const recycledCountryData = recycledLayer?.attributes.ValuePerCountry.find(
        (item) => item.CountryName === country
      )

      setRecycledData(recycledCountryData ? recycledCountryData.Value : 0)
    }

    fetchData()
  }, [country, layers, loading])

  const getBarOption = () => ({
    title: {
      text: `Waste Recycling Proportion for ${country}`,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: '{b}: {c}%',
    },
    legend: {
      data: ['Recycled', 'Not Recycled'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['Recycled'],
    },
    yAxis: {
      type: 'value',
      max: 100,
      name: 'Percentage (%)',
    },
    series: [
      {
        name: 'Recycled',
        type: 'bar',
        stack: 'total',
        data: [recycledData],
        barWidth: '50%',
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}%',
        },
        itemStyle: {
          color: '#28a745',
        },
      },
      {
        name: 'Not Recycled',
        type: 'bar',
        stack: 'total',
        data: [100 - recycledData],
        barWidth: '50%',
        itemStyle: {
          color: '#dc3545',
        },
      },
    ],
  })

  return (
    <ReactEcharts
      option={getBarOption()}
      style={{ height: '400px', width: '100%' }}
    />
  )
}

export default WasteProportionBarChart
