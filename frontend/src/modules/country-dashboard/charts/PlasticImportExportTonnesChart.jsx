import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'

const PlasticImportExportChart = ({ layers, loading }) => {
  const router = useRouter()
  const { country, countryCode } = router.query

  const [importData, setImportData] = useState([])
  const [exportData, setExportData] = useState([])

  const categories = [
    'plasticinPrimaryForm',
    'intermediateFormsOfPlastic',
    'finalManufacturedPlasticGoods',
    'intermediateManufacturedPlasticGoods',
    'plasticWaste',
  ]

  const categoriesTitle = [
    { plasticinPrimaryForm: 'Plastic in primary form' },
    { intermediateFormsOfPlastic: 'Intermediate forms of plastic' },
    { finalManufacturedPlasticGoods: 'Final manufactured plastic goods' },
    {
      intermediateManufacturedPlasticGoods:
        'Intermediate manufactured plastic goods',
    },
    { plasticWaste: 'Plastic waste' },
  ]

  useEffect(() => {
    const fetchData = () => {
      if (loading || !country || !layers.length) return

      const importLayers = {
        plasticinPrimaryForm: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Plastic_in_primary_form___value__import__V2_WFL1'
        ),
        intermediateFormsOfPlastic: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Intermediate_forms_of_plastic___value__import__WFL1'
        ),
        finalManufacturedPlasticGoods: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Final_manufactured_plastic_goods___value__import__WFL1'
        ),
        intermediateManufacturedPlasticGoods: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Intermediate_man___value__import__V2_WFL1'
        ),
        plasticWaste: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Plastic_waste___value__import__V2_WFL1'
        ),
      }

      const exportLayers = {
        plasticinPrimaryForm: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Plastic_in_primary_form___value__export__V2_WFL1'
        ),
        intermediateFormsOfPlastic: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Intermediate_forms_of_plastic___value__export__V2_WFL1'
        ),
        finalManufacturedPlasticGoods: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Final_manufactured_plastic_goods___value__export__V2_WFL1'
        ),
        intermediateManufacturedPlasticGoods: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Intermediate_man___value__export__WFL1'
        ),
        plasticWaste: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Plastic_waste___value__export__V2_WFL1'
        ),
      }

      const getLatestYearData = (data) => {
        if (!data || data.length === 0) return null
        const sortedData = data.sort((a, b) => b.Year - a.Year)
        return sortedData[0]
      }

      const importResults = categories.map((category) => {
        const layer = importLayers[category]
        const data = getLatestYearData(
          layer?.attributes?.ValuePerCountry?.filter((item) =>
            item.CountryCode
              ? item.CountryCode === countryCode
              : item.CountryName === decodeURIComponent(country)
          )
        )
        return data ? parseFloat(data.Value.toFixed(2)) : 0
      })

      const exportResults = categories.map((category) => {
        const layer = exportLayers[category]
        const data = getLatestYearData(
          layer?.attributes?.ValuePerCountry?.filter((item) =>
            item.CountryCode
              ? item.CountryCode === countryCode
              : item.CountryName === decodeURIComponent(country)
          )
        )
        return data ? parseFloat(data.Value.toFixed(2)) : 0
      })

      setImportData(importResults)
      setExportData(exportResults)
    }

    fetchData()
  }, [country, layers, loading])

  const getOption = () => ({
    title: {
      text: `Plastic import & export value for ${decodeURIComponent(country)}`,
      textStyle: { fontSize: 18, fontWeight: 'bold', color: '#020A5B' },
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',

      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: categoriesTitle.map((category) => Object.values(category)[0]),
      textStyle: { color: '#020A5B' },
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      textStyle: { color: '#020A5B' },
      bottom: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} ',
        fontSize: 12,
        color: '#020A5B',
      },
      textStyle: { color: '#020A5B' },
    },
    yAxis: {
      type: 'category',
      name: 'million US dollars',
      axisLabel: {
        formatter: '{value} ',
        fontSize: 12,
        color: '#020A5B',
      },
      nameTextStyle: {
        color: '#020A5B',
        fontSize: 12,
      },
      data: ['Import', 'Export'],
    },
    series: categories.map((category, index) => ({
      name: Object.values(categoriesTitle[index])[0],
      type: 'bar',
      stack: 'ImportExport',
      data: [importData[index], exportData[index]],
      itemStyle: {
        color: ['#384E85', '#FFB800', '#f56a00', '#A7AD3E', '#FFA424'][index],
      },
    })),
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
          href={`https://unctad.org/publication/global-trade-plastics-insights-first-life-cycle-trade-database`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#020A5B', fontWeight: 'bold' }}
        >
          UNCTAD 2021
        </a>{' '}
      </div>
    </div>
  )
}

export default PlasticImportExportChart
