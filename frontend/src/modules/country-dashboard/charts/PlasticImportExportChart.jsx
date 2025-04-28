import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import { getBaseUrl } from '../../../utils/misc'
import { t, Trans } from '@lingui/macro'

const PlasticImportExportChart = ({ layers, loading }) => {
  const router = useRouter()
  const baseURL = getBaseUrl()
  const { country, countryCode } = router.query
  const [years, setYears] = useState([])
  const [totalImports, setTotalImports] = useState([])
  const [totalExports, setTotalExports] = useState([])

  useEffect(() => {
    const fetchData = () => {
      if (loading || !country || !layers.length) return

      const importLayer = layers?.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Total_plastic___value__import__V2_WFL1'
      )
      const exportLayer = layers?.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Total_plastic___value__export__V2_WFL1'
      )

      if (!importLayer || !exportLayer) {
        console.warn(t`Import or export layer not found.`)
        return
      }

      const filteredImports = [...new Map(
        importLayer.attributes.ValuePerCountry
          ?.filter(item => 
            item.CountryCode
              ? item.CountryCode === countryCode
              : item.CountryName === decodeURIComponent(country)
          )
          .map(item => [`${item.CountryCode}-${item.Year}`, item])
      ).values()];

      const filteredExports = [...new Map(
        exportLayer.attributes.ValuePerCountry
          ?.filter(item => 
            item.CountryCode
              ? item.CountryCode === countryCode
              : item.CountryName === decodeURIComponent(country)
          )
          .map(item => [`${item.CountryCode}-${item.Year}`, item])
      ).values()];

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

  const plasticText = window.innerWidth < 768
  ? t`Plastic import & export value\nfor ${decodeURIComponent(country)}`
  : t`Plastic import & export value for ${decodeURIComponent(country)}`
  
  const getOption = () => ({
    title: {
      text:plasticText,
      left: 'center',
      textStyle: {
        fontSize: window.innerWidth < 768 ? 14 : 18,
        fontWeight: 'bold',
        color: '#020A5B',
        wordWrap: 'break-word',
        overflow: 'break',
      },
    },
    grid: {
      left: '6%',
      right: '4%',
      top: '20%',
      textStyle: { color: '#020A5B' },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: [t`Total exports`, t`Total imports`],
      textStyle: { color: '#020A5B' },
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      textStyle: { color: '#020A5B' },
      data: years,
      axisLabel: {
        formatter: '{value} ',
        fontSize: 12,
        color: '#020A5B',
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} ',
        fontSize: 12,
        color: '#020A5B',
      },
      name: t`million US dollars`,
      nameTextStyle: {
        color: '#020A5B',
        fontSize: 12,
      },
    },
    series: [
      {
        name: t`Total exports`,
        type: 'line',
        data: totalExports,
        symbol: 'circle',
        itemStyle: {
          color: '#020A5B',
        },
      },
      {
        name: t`Total imports`,
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
          href={`${baseURL}/data/maps?categoryId=industry-and-trade&subcategoryId=Import&layer=Plastic_waste___value__import__WFL1`}
          style={{ color: '#020A5B', fontWeight: 'bold' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          UNCTAD 2022
        </a>
      </div>
    </div>
  )
}

export default PlasticImportExportChart
