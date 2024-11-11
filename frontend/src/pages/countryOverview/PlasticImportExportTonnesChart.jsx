import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import useLayerInfo from '../../hooks/useLayerInfo'

const PlasticImportExportChart = () => {
  const router = useRouter()
  const { country } = router.query
  const { layers, loading } = useLayerInfo()

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
            'Plastic_in_primary_form___value__import__WFL1'
        ),
        intermediateFormsOfPlastic: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Intermediate___value__import__WFL1'
        ),
        finalManufacturedPlasticGoods: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Final_manufactured_plastics_goods___Import__million__WFL1'
        ),
        intermediateManufacturedPlasticGoods: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Inter__man_plastic_goods___value_V3_WFL1'
        ),
        plasticWaste: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Plastic_waste___value__import__WFL1'
        ),
      }

      const exportLayers = {
        plasticinPrimaryForm: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Plastic_in_primary_form___value__export__WFL1'
        ),
        intermediateFormsOfPlastic: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Intermediate_forms_of_plastic___value__export__WFL1'
        ),
        finalManufacturedPlasticGoods: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Final_manufactured_plastic_goods___value__export__WFL1'
        ),
        intermediateManufacturedPlasticGoods: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Intermediate_V2___value__export__WFL1'
        ),
        plasticWaste: layers.find(
          (layer) =>
            layer.attributes.arcgislayerId ===
            'Plastic_waste___value__export__WFL1'
        ),
      }

      const importResults = categories.map((category) => {
        const layer = importLayers[category]

        const data = layer?.attributes.ValuePerCountry.find(
          (item) => item.CountryName === country
        )
        return data ? data.Value : 0
      })

      const exportResults = categories.map((category) => {
        const layer = exportLayers[category]
        const data = layer?.attributes.ValuePerCountry.find(
          (item) => item.CountryName === country
        )
        return data ? data.Value : 0
      })

      setImportData(importResults)
      setExportData(exportResults)
    }

    fetchData()
  }, [country, layers, loading])

  const getOption = () => ({
    title: {
      text: `Plastic Import & Export (value) for ${country}`,
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
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      name: 'million US dollars',
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
    <ReactEcharts
      option={getOption()}
      style={{ height: '400px', width: '100%' }}
    />
  )
}

export default PlasticImportExportChart
