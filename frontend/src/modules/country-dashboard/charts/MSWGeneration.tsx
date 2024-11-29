import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import useRegions from '../../../hooks/useRegions'
import { getBaseUrl } from '../../../utils/misc'

const MSWGenerationChart = ({ layers, layerLoading }) => {
  const router = useRouter()
  const baseURL = getBaseUrl()
  const { country, countryCode } = router.query
  const { countriesWithRegions, loading: regionLoading } = useRegions()

  const [nationalEstimate, setNationalEstimate] = useState(0)
  const [cityEstimates, setCityEstimates] = useState([])
  const [cities, setCities] = useState([])
  const [regionMswValue, setRegionMswValue] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (layerLoading || regionLoading || !country || !layers.length) return

      const layerMapping = {
        national: 'Municipal_solid_waste_generated_daily_per_capita_V3_WFL1',
        city: 'MSW_generation_rate__kg_cap_day__WFL1',
      }

      const nationalLayer = layers?.find(
        (layer) => layer?.attributes?.arcgislayerId === layerMapping?.national
      )
      const cityLayer = layers?.find(
        (layer) => layer?.attributes?.arcgislayerId === layerMapping?.city
      )

      const nationalData = nationalLayer?.attributes.ValuePerCountry?.find(
        (item) =>
          item.CountryCode
            ? item.CountryCode === countryCode
            : item.CountryName === decodeURIComponent(country)
      )

      const cityData = cityLayer?.attributes?.ValuePerCountry?.filter((item) =>
        item.CountryCode
          ? item.CountryCode === countryCode
          : item.CountryName === decodeURIComponent(country)
      )

      setNationalEstimate(nationalData ? nationalData.Value : 0)
      setCityEstimates(cityData ? cityData.map((item) => item?.Value) : [])
      setCities(
        cityData
          ? cityData.map((item, index) => item.City || `City ${index + 1}`)
          : []
      )

      const selectedCountry = countriesWithRegions.find(
        (c) => c.CountryName === country
      )
      if (selectedCountry) {
        setRegionMswValue(selectedCountry.regionMswValue)
      }
    }

    fetchData()
  }, [country, layers, layerLoading, countriesWithRegions, regionLoading])

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
        text: `Per capita MSW generation for ${decodeURIComponent(
          country?.toString()
        )}`,
        left: 'center',
        textStyle: { fontSize: 18, fontWeight: 'bold', color: '#020A5B' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          let content = `${params[0]?.axisValue}<br/>`
          params.forEach((item) => {
            content += `${item.marker} ${item.seriesName}: ${
              item.value || '-'
            } kg/person/day<br/>`
          })
          if (regionMswValue) {
            content += `<br/><span style="color: #020A5B; font-weight: bold;">Estimated Regional Average:</span> ${regionMswValue} kg/person/day`
          }
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
        textStyle: { fontSize: 12, color: '#020A5B' },
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          color: '#020A5B',
          fontSize: 12,
          fontWeight: 'bold',
        },
      },
      yAxis: {
        type: 'value',
        name: 'kg/person/day',
        min: 0,
        max: 2,
        interval: 0.5,
        nameTextStyle: {
          fontSize: 12,
          color: '#020A5B',
          fontWeight: 'bold',
        },
        axisLabel: {
          formatter: '{value} ',
          fontSize: 12,
          color: '#020A5B',
        },
        splitLine: { show: true },
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
              params.value ? params.value.toFixed(2) + ' kg' : '',
            color: '#020A5B',
            fontWeight: 'bold',
          },
          markLine: {
            data: [
              {
                yAxis: regionMswValue || 0.78,
                label: {
                  formatter: () =>
                    `Regional Average (${regionMswValue || 0.78}) kg`,
                  position: 'middle',
                  color: '#020A5B',
                  fontSize: 12,
                },
                lineStyle: {
                  type: 'dashed',
                  color: '#FF0000',
                },
              },
            ],
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
          color: '#020A5B',
          fontSize: '12px',
        }}
      >
        Data source:{' '}
        <a
          href={`${baseURL}/data/maps?categoryId=waste-management&subcategoryId=generation&layer=Municipal_solid_waste_generated_daily_per_capita_V3_WFL1`}
          style={{ color: '#020A5B', fontWeight: 'bold' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          UNEP 2020
        </a>{' '}
        and
        <a
          href={`${baseURL}/data/maps?categoryId=waste-management&subcategoryId=generation&layer=MSW_generation_rate__kg_cap_day__WFL1`}
          style={{ color: '#020A5B', fontWeight: 'bold' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          {' '}
          UN Habitat 2021
        </a>
      </div>
    </div>
  )
}

export default MSWGenerationChart
