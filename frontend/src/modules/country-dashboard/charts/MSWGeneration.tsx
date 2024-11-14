import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import useLayerInfo from '../../../hooks/useLayerInfo'

const MSWGenerationChart = () => {
  const router = useRouter()
  const { country } = router.query
  const { layers, loading } = useLayerInfo()
  const [nationalEstimate, setNationalEstimate] = useState(0)
  const [dakarEstimates, setDakarEstimates] = useState([])
  const [cities, setCities] = useState([])
  const [year, setYear] = useState('')

  useEffect(() => {
    const fetchData = () => {
      if (loading || !country || !layers.length) return

      const layerMapping = {
        national: 'Municipal_solid_waste_generated_daily_per_capita_V3_WFL1',
        dakar: 'MSW_generation_rate__kg_cap_day__WFL1',
      }

      const nationalLayer = layers.find(
        (layer) => layer.attributes.arcgislayerId === layerMapping.national
      )
      const dakarLayer = layers.find(
        (layer) => layer.attributes.arcgislayerId === layerMapping.dakar
      )

      const nationalData = nationalLayer?.attributes.ValuePerCountry.find(
        (item) => item.CountryName === country
      )

      const dakarData = dakarLayer?.attributes.ValuePerCountry.filter(
        (item) => item.CountryName === country
      )

      setNationalEstimate(nationalData ? nationalData.Value : 0)
      setDakarEstimates(dakarData ? dakarData.map((item) => item.Value) : [])
      setCities(dakarData ? dakarData.map((item) => item.City) : [])
      setYear(nationalData?.Year || '')
    }

    fetchData()
  }, [country, layers, loading])

  const getOption = () => {
    const categories = ['National estimate', ...cities]
    const seriesData = [
      {
        name: 'National estimate',
        type: 'bar',
        barWidth: '25%',
        data: [nationalEstimate, ...new Array(cities.length).fill(null)],
        itemStyle: { color: '#00A4EC' },
        label: {
          show: true,
          position: 'top',
          formatter: (params) => (params.value ? params.value.toFixed(2) : ''),
          color: '#1F3A93',
          fontWeight: 'bold',
        },
      },
      ...cities.map((city, index) => ({
        name: `${city} estimate`,
        type: 'bar',
        barWidth: '25%',
        data: [
          ...new Array(index + 1).fill(null),
          dakarEstimates[index],
          ...new Array(cities.length - index - 1).fill(null),
        ],
        itemStyle: { color: index === 0 ? '#FF6F00' : '#FF5733' },
        label: {
          show: true,
          position: 'top',
          formatter: (params) => (params.value ? params.value.toFixed(2) : ''),
          color: '#1F3A93',
          fontWeight: 'bold',
        },
      })),
    ]

    return {
      title: {
        text: `Per capita MSW generation for ${country}`,
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1F3A93',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params) => {
          let content = `${params[0].axisValue}<br/>`
          params.forEach((item) => {
            content += `${item.marker} ${item.seriesName}: ${
              item.value || '-'
            } kg/person/day<br/>`
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
        name: 'kg/person/day',
        min: 0,
        max: 2,
        interval: 1,
        nameTextStyle: {
          fontSize: 12,
          color: '#1F3A93',
          fontWeight: 'bold',
        },
        axisLabel: {
          formatter: '{value} ',
          fontSize: 12,
          color: '#1F3A93',
          rotate: 90,
        },
      },
      series: seriesData,
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

export default MSWGenerationChart