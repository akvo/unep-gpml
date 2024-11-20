import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import useLayerInfo from '../../../hooks/useLayerInfo'
import { getBaseUrl } from '../../../utils/misc'

const PlasticOceanBeachChart = () => {
  const router = useRouter()
  const baseURL = getBaseUrl()
  const { country } = router.query
  const { layers, loading } = useLayerInfo()
  const [oceanPercentage, setOceanPercentage] = useState(0)
  const [beachPercentage, setBeachPercentage] = useState(0)

  useEffect(() => {
    const fetchData = () => {
      if (loading || !country || !layers.length) return

      const oceanLayer = layers.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Mismanaged_plastic_waste_escaping_to_oceans_V4_WFL1'
      )
      const coastLayer = layers.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Mismanaged_plastic_waste_escaping_to_oceans_and_coasts_V3_WFL1'
      )
      const beachLayer = layers.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Mismanaged_plastic_waste_escaping_to_beaches_V3_WFL1'
      )

      if (!oceanLayer || !coastLayer || !beachLayer) {
        console.warn('One of the required layers not found.')
        return
      }

      const oceanValue =
        oceanLayer.attributes.ValuePerCountry.find(
          (item) => item.CountryName === country
        )?.Value || 0
      const coastValue =
        coastLayer.attributes.ValuePerCountry.find(
          (item) => item.CountryName === country
        )?.Value || 1
      const beachValue =
        beachLayer.attributes.ValuePerCountry.find(
          (item) => item.CountryName === country
        )?.Value || 0

      const calculatedOceanPercentage = (
        (oceanValue * 100) /
        coastValue
      ).toFixed(2)
      const calculatedBeachPercentage = (
        (beachValue * 100) /
        coastValue
      ).toFixed(2)

      setOceanPercentage(calculatedOceanPercentage)
      setBeachPercentage(calculatedBeachPercentage)
    }

    fetchData()
  }, [country, layers, loading])

  const getOption = () => ({
    title: {
      text: 'Mismanaged plastic reaching oceans and coasts​',
      subtext: `Percentage of the mismanaged waste between years 2010-2019`,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#020A5B',
      },
      subtextStyle: {
        fontSize: 12,
        color: '#020A5B',
        fontFamily: 'Roboto, Helvetica Neue, sans-serif',
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} tonnes ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: ['Ends up on the coasts', 'Ends up in the ocean'],
      textStyle: {
        fontSize: 12,
        color: '#020A5B',
      },
    },
    series: [
      {
        name: 'Plastic distribution',
        type: 'pie',
        top: '15%',
        radius: ['40%', '80%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 0,
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
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          {
            value: beachPercentage,
            name: 'Ends up in beaches',
            itemStyle: { color: '#ffc107' },
          },
          {
            value: oceanPercentage,
            name: 'Ends up in the ocean',
            itemStyle: { color: '#007bff' },
          },
        ],
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
          href={`${baseURL}/data/maps?categoryId=environmental-impact&subcategoryId=ocean-and-coast&layer=Mismanaged_plastic_waste_escaping_to_oceans_and_coasts_V3_WFL1`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#020A5B', fontWeight: 'bold' }}
        >
          ​​Florida State University and UNEP, 2021
        </a>{' '}
      </div>
    </div>
  )
}

export default PlasticOceanBeachChart
