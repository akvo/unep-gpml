import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import useLayerInfo from '../../../hooks/useLayerInfo'

const PlasticCompositionChart = () => {
  const router = useRouter()
  const { country } = router.query
  const { layers, loading } = useLayerInfo()
  const [nationalEstimate, setNationalEstimate] = useState(0)
  const [cityEstimates, setCityEstimates] = useState([])
  const [cities, setCities] = useState([])

  useEffect(() => {
    const fetchData = () => {
      if (loading || !country || !layers.length) return

      const layerMapping = {
        national: 'Municipal_solid_waste_generated_daily_per_capita_V3_WFL1',
        cities: 'Proportion_of_plastic_waste_generated_WFL1',
      }

      const nationalLayer = layers?.find(
        (layer) => layer.attributes.arcgislayerId === layerMapping.national
      )
      const cityLayer = layers?.find(
        (layer) => layer.attributes.arcgislayerId === layerMapping.cities
      )

      const nationalData = nationalLayer?.attributes.ValuePerCountry?.find(
        (item) => item.CountryName === country
      )

      const cityData = cityLayer?.attributes.ValuePerCountry?.filter(
        (item) => item?.CountryName === country
      )

      setNationalEstimate(nationalData ? nationalData?.Value : 0)
      setCityEstimates(cityData ? cityData?.map((item) => item?.Value) : [])
      setCities(cityData ? cityData?.map((item) => item.City) : [])
    }

    fetchData()
  }, [country, layers, loading])

  const getOption = () => {
    const categories = ['National estimate', ...cities]
    const dataValues = [
      {
        value: nationalEstimate,
        itemStyle: { color: '#00A4EC' },
        name: 'National estimate',
      },
      ...cityEstimates.map((estimate, index) => ({
        value: estimate,
        itemStyle: { color: index === 0 ? '#FF6F00' : '#FF5733' },
        name: `${cities[index]} estimate`,
      })),
    ]

    return {
      title: {
        text: `Plastic composition in the MSW for ${country}`,
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1F3A93',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          let content = `${params[0].axisValue}<br/>`
          params.forEach((item) => {
            content += `${item.marker} ${item.seriesName}: ${
              item.value || '-'
            }%<br/>`
          })
          return content
        },
      },
      legend: {
        data: [
          'National estimate',
          ...cities.map((city) => `${city} estimate`),
        ],
        bottom: 0,
        itemGap: 20,
        textStyle: {
          fontSize: 12,
          color: '#1F3A93',
        },
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          color: '#1F3A93',
          fontSize: 12,
          fontWeight: 'bold',
        },
      },
      yAxis: {
        type: 'value',
        name: '%',
        min: 0,
        max: 100, // Set the max to 100 for percentage values
        interval: 20, // Set an appropriate interval for better readability
        nameTextStyle: {
          fontSize: 12,
          color: '#1F3A93',
          fontWeight: 'bold',
        },
        axisLabel: {
          formatter: '{value} ',
          fontSize: 12,
          color: '#1F3A93',
        },
      },
      series: [
        {
          name: 'Estimates',
          type: 'bar',
          barWidth: '40%',
          data: dataValues,
          label: {
            show: true,
            position: 'top',
            formatter: (params) =>
              params.value ? `${params.value.toFixed(2)}%` : '',
            color: '#1F3A93',
            fontWeight: 'bold',
          },
        },
      ],
      barCategoryGap: '50%',
    }
  }

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
          color: '#1F3A93',
          fontSize: '12px',
        }}
      >
        Data provided by UNEP.{' '}
        <a href="https://example.com" style={{ color: '#1F3A93' }}>
          See source here
        </a>
      </div>
    </div>
  )
}

export default PlasticCompositionChart