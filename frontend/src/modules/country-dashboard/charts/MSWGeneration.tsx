import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import useLayerInfo from '../../../hooks/useLayerInfo'

const MSWGenerationChart = () => {
  const router = useRouter()
  const { country } = router.query
  const { layers, loading } = useLayerInfo()
  const [nationalEstimate, setNationalEstimate] = useState(0)
  const [dakarEstimate, setDakarEstimate] = useState(0)
  const [city, setCity] = useState('')
  const [year, setYear] = useState('')

  useEffect(() => {
    const fetchData = () => {
      if (loading || !country || !layers.length) return

      const layerMapping = {
        national: 'Municipal_solid_waste_generated_daily_per_capita_V3_WFL1',
        dakar: 'Plastic_waste_generation_from_MSW__kg_capita_year__V2_WFL1',
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
      const dakarData = dakarLayer?.attributes.ValuePerCountry.find(
        (item) => item.CountryName === country
      )

      console.log('dsdad', nationalData)
      setNationalEstimate(nationalData ? nationalData.Value : 0)
      setDakarEstimate(dakarData ? dakarData.Value / 365 : 0)
      setYear(nationalData.Year)
      setCity(dakarData?.City)
    }

    fetchData()
  }, [country, layers, loading])

  console.log('dsdad', year)

  const getOption = () => ({
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
    },
    legend: {
      data: [`National average ${year}`, ` ${city} estimate ${year}`],
      bottom: 0,
      itemGap: 20,
      textStyle: {
        fontSize: 12,
        color: '#1F3A93',
      },
    },
    xAxis: {
      type: 'category',
      data: [`National average ${year}`, ` ${city} estimate ${year}`],
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

    series: [
      {
        name: 'National estimate',
        type: 'bar',
        barWidth: '40%',
        data: [nationalEstimate, null],
        itemStyle: { color: '#00A4EC' },
        label: {
          show: true,
          position: 'top',
          formatter: (params) => (params.value ? params.value.toFixed(2) : ''),
          color: '#1F3A93',
          fontWeight: 'bold',
        },
      },
      {
        name: 'Dakar estimate',
        type: 'bar',
        barWidth: '40%',
        data: [null, dakarEstimate],
        itemStyle: { color: '#FF6F00' },
        label: {
          show: true,
          position: 'top',
          formatter: (params) => (params.value ? params.value.toFixed(2) : ''),
          color: '#1F3A93',
          fontWeight: 'bold',
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
