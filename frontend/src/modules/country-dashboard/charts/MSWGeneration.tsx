import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import useRegions from '../../../hooks/useRegions'
import { getBaseUrl } from '../../../utils/misc'
import { t } from '@lingui/macro'
import { splitIntoTwoLines } from './PlasticImportExportChart'

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

      // Filter out city entries without a proper name
      const namedCities = cityData
        ? cityData.filter((item) => item.City && item.City.trim() !== '')
        : []
      setCityEstimates(namedCities.map((item) => item?.Value))
      setCities(namedCities.map((item) => item.City))

      const selectedCountry = countriesWithRegions.find(
        (c) => c.CountryName === country
      )
      if (selectedCountry) {
        setRegionMswValue(selectedCountry.regionMswValue)
      }
    }

    fetchData()
  }, [country, layers, layerLoading, countriesWithRegions, regionLoading])

  const tNatEstimate = t`National estimate`
  const tRegionalAvg = t`Regional Average`.replace(' ', '\n')

  const textTitle = splitIntoTwoLines(
    t`Per capita MSW generation for ${decodeURIComponent(country?.toString())}`
  )
  const tKgPersonDay = t`Kg/person/day`

  const getOption = () => {
    const categories = [tNatEstimate, ...cities]
    const dataValues = [
      {
        value: nationalEstimate,
        itemStyle: { color: '#00A4EC' },
        name: tNatEstimate,
      },
      ...cityEstimates.map((estimate, index) => ({
        value: estimate,
        itemStyle: { color: index === 0 ? '#FF6F00' : '#FF5733' },
        name: `${cities[index]} estimate`,
      })),
    ]
    const maxValue = Math.max(...dataValues.map((d) => d.value)) 
    const dynamicMax =  Math.ceil(maxValue + maxValue * 0.3)
    return {
      title: {
        text: textTitle,
        left: 'center',
        textStyle: {
          fontSize: window.innerWidth < 768 ? 14 : 18,
          fontWeight: 'bold',
          color: '#020A5B',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          let content = `${params[0]?.axisValue}<br/>`
          params.forEach((item) => {
            content += `${item.marker} ${item.seriesName}: ${
              item.value || '-'
            } ${tKgPersonDay}<br/>`
          })
          if (regionMswValue) {
            content += `<br/><span style="color: #020A5B; font-weight: bold;">${t`Estimated Regional Average`}:</span> ${regionMswValue} ${tKgPersonDay}`
          }
          return content
        },
      },
      legend: {
        data: [tNatEstimate, ...cities.map((city) => t`${city} estimate`)],
        bottom: 0,
        itemGap: 20,
        textStyle: { fontSize: 12, color: '#020A5B' },
      },
      xAxis: {
        type: 'category',
        data: categories.map(function (str) {
          return str.replace(' ', '\n')
        }),
        axisLabel: {
          color: '#020A5B',
          ...(window.innerWidth < 768
            ? {
                width: 50,
                overflow: 'break',
                interval: 0,
                fontSize: 9,
                rotate: 30,
              }
            : {
                fontWeight: 'bold',
                width: 70,
                overflow: 'break',
                interval: 0,
                fontSize: 10,
              }),
        },
      },
      yAxis: {
        type: 'value',
        name: tKgPersonDay,
        min: 0,
        max: dynamicMax,
        interval: 0.5,
        nameTextStyle: {
          fontSize: 12,
          color: '#020A5B',
          fontWeight: 'bold',
        },
        axisLabel: {
          color: '#020A5B',
          fontSize: 11,
          fontWeight: 'bold',
        },
        splitLine: { show: true },
      },
      grid: {
        left: 30,
        right: 60,
        top: 80,
        containLabel: true,
      },
      series: [
        {
          name: 'Estimates',
          type: 'bar',
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
                name: tRegionalAvg,
                yAxis: regionMswValue || 0.78,
                label: {
                  formatter: () =>
                    `${tRegionalAvg} \n(${regionMswValue || 0.78} kg)`,
                  position: 'end',
                  fontSize: 11,
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
        {t`Data source:`}{' '}
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
