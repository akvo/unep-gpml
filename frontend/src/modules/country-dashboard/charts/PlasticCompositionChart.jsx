import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import useRegions from '../../../hooks/useRegions'
import { getBaseUrl } from '../../../utils/misc'

const PlasticCompositionChart = ({ layers, layerLoading }) => {
  const router = useRouter()
  const { country, countryCode } = router.query
  const [nationalEstimate, setNationalEstimate] = useState(0)
  const [cityEstimates, setCityEstimates] = useState([])
  const [cities, setCities] = useState([])
  const baseURL = getBaseUrl()

  const { countriesWithRegions, loading: regionLoading } = useRegions()

  const [regionPlasticComposition, setRegionPlasticComposition] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (layerLoading || regionLoading || !country || !layers.length) return

      const layerMapping = {
        national: 'Municipal_solid_waste_plastic_composition_4_WFL1',
        cities: 'Proportion_of_plastic_waste_generated_WFL1',
      }

      const nationalLayer = layers?.find(
        (layer) => layer.attributes.arcgislayerId === layerMapping?.national
      )

      const cityLayer = layers?.find(
        (layer) => layer.attributes.arcgislayerId === layerMapping?.cities
      )
      const nationalData = nationalLayer?.attributes.ValuePerCountry?.find(
        (item) =>
          item?.CountryCode
            ? item?.CountryCode === countryCode
            : item.CountryName === decodeURIComponent(country)
      )

      const cityData = cityLayer?.attributes.ValuePerCountry?.filter((item) =>
        item.CountryCode !== null
          ? item.CountryCode === countryCode
          : item.CountryName === decodeURIComponent(country)
      )

      setNationalEstimate(nationalData ? nationalData?.Value : 0)
      setCityEstimates(cityData ? cityData?.map((item) => item?.Value) : [])
      setCities(cityData ? cityData?.map((item) => item.City) : [])

      const selectedCountry = countriesWithRegions.find((c) =>
        c.CountryCode !== null
          ? c.CountryCode === countryCode
          : c.CountryName === decodeURIComponent(country)
      )
      if (selectedCountry) {
        setRegionPlasticComposition(selectedCountry.regionPlasticComposition)
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
        text: `Plastic composition in the MSW for ${decodeURIComponent(country)}`,
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#020A5B',
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
          if (regionPlasticComposition) {
            content += `<br/><span style="color: #020A5B; font-weight: bold;">Estimated Regional Average:</span> ${regionPlasticComposition} %`
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
        textStyle: {
          fontSize: 12,
          color: '#020A5B',
        },
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
        name: '%',
        min: 0,
        max: 60,
        interval: 20,
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
              params.value ? `${params.value.toFixed(0)}%` : '',
            color: '#020A5B',
            fontWeight: 'bold',
          },
          markLine: {
            data: [
              {
                yAxis: regionPlasticComposition || 0.78,
                label: {
                  formatter: () =>
                    `Regional Average (${
                      regionPlasticComposition + '%' || 0.78 + '%'
                    })`,
                  position: 'middle',
                  color: '#020A5B',
                  fontSize: 12,
                },
                lineStyle: {
                  type: 'dashed',
                  color: '#020A5B',
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
          href={`${baseURL}/data/maps?categoryId=waste-management&subcategoryId=generation&layer=Proportion_of_plastic_waste_generated_WFL1`}
          style={{ color: '#020A5B', fontWeight: 'bold' }}
        >
          World Bank
        </a>{' '}
      </div>
    </div>
  )
}

export default PlasticCompositionChart
