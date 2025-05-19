import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import useRegions from '../../../hooks/useRegions'
import { getBaseUrl } from '../../../utils/misc'
import { t, Trans } from '@lingui/macro'
import { splitIntoTwoLines } from './PlasticImportExportChart'

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

  const tNatEstimate = t`National estimate`
  const tRegionalAvg = t`Regional Average`.replace(' ', '\n')

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
        name: t`${cities[index]} estimate`,
      })),
    ]
    const tTitle = splitIntoTwoLines(
      t`Plastic composition in the MSW for ${decodeURIComponent(country)}`,
      true
    )
    return {
      title: {
        text: tTitle,
        left: 'center',
        textStyle: {
          fontSize: window.innerWidth < 768 ? 13 : 18,
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
            content += `<br/><span style="color: #020A5B; font-weight: bold;">${t`Estimated Regional Average`}:</span> ${regionPlasticComposition} %`
          }
          return content
        },
      },
      grid: {
        right: 70,
        top: 80,
        containLabel: true,
      },
      legend: {
        data: [tNatEstimate, ...cities.map((city) => `${city} estimate`)],
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
          fontSize: 10,
          ...(window.innerWidth < 768
            ? {}
            : {
                fontWeight: 'bold',
                width: 70,
                overflow: 'break',
                interval: 0,
              }),
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
          name: t`Estimates`,
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
                name: tRegionalAvg,
                yAxis: regionPlasticComposition || 0.78,
                label: {
                  formatter: () =>
                    `${tRegionalAvg} \n(${
                      regionPlasticComposition + '%' || 0.78 + '%'
                    })`,
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
          // markLine: {
          //   data: [
          //     {
          //       yAxis: regionPlasticComposition || 0.78,
          //       label: {
          //         formatter: () =>
          //           `${tRegionalAvg} \n(${
          //             regionPlasticComposition + '%' || 0.78 + '%'
          //           })`,
          //         position: 'middle',
          //         offset: [window.innerWidth < 768 ? 170 : 220, -5],
          //         color: '#020A5B',
          //         fontSize: 12,
          //       },
          //       lineStyle: {
          //         type: 'dashed',
          //         color: '#020A5B',
          //       },
          //     },
          //   ],
          // },
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
        <Trans>Data source: </Trans>{' '}
        <a
          href={`${baseURL}/data/maps?categoryId=waste-management&subcategoryId=generation&layer=Proportion_of_plastic_waste_generated_WFL1`}
          style={{ color: '#020A5B', fontWeight: 'bold' }}
        >
          <Trans> World Bank</Trans>
        </a>{' '}
      </div>
    </div>
  )
}

export default PlasticCompositionChart
