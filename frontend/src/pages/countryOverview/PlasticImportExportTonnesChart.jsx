import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import axios from 'axios'
import { useRouter } from 'next/router'

const PlasticImportExportChart = () => {
  const router = useRouter()
  const { country } = router.query

  const [importData, setImportData] = useState([])
  const [exportData, setExportData] = useState([])

  const categories = [
    'Plastic in primary forms',
    'Intermediate forms of plastic',
    'Final manufactured plastic goods',
    'Intermediate manufactured plastic goods',
    'Plastic waste',
  ]

  const layerUrls = {
    import: {
      plasticinPrimaryForm:
        'https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/Plastics_in_primary_forms___weight__import__WFL1/FeatureServer/0/query',
      intermediateFormsOfPlastic:
        'https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/Intermediate_forms_of_plastic_weight____import__WFL1/FeatureServer/0/query',
      finalManufacturedPlasticGoods:
        'https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/Final_manufactured_plastics_goods___weight__import__WFL1/FeatureServer/0/query',
      intermediateManufacturedPlasticGoods:
        'https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/Intermediate___weight__import__WFL1/FeatureServer/0/query',
      plasticWaste:
        'https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/Plastic_waste_weigth____import__WFL1/FeatureServer/0/query',
    },
    export: {
      plasticinPrimaryForm:
        'https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/Plastics_in_primary_forms___weight__export__WFL1/FeatureServer/0/query',
      intermediateFormsOfPlastic:
        'https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/Intermediate_forms_of_plastic_weight____export__WFL1/FeatureServer/0/query',
      finalManufacturedPlasticGoods:
        'https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/Final_manufactured_plastics_goods_weight____export__WFL1/FeatureServer/0/query',
      intermediateManufacturedPlasticGoods:
        'https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/Intermediate___weight__export__WFL1/FeatureServer/0/query',
      plasticWaste:
        'https://services3.arcgis.com/pI4ewELlDKS2OpCN/arcgis/rest/services/Plastic_waste_weigth____export__WFL1/FeatureServer/0/query',
    },
  }

  const fetchCategoryData = async (url, country) => {
    const query = `?where=Country='${country}'&outFields=Year,Value&orderByFields=Year DESC&f=json&resultRecordCount=1`
    const { data } = await axios.get(`${url}${query}`)

    return data.features.length > 0 ? data.features[0].attributes.Value : 0
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const importResults = await Promise.all(
          Object.values(layerUrls.import).map((url) =>
            fetchCategoryData(url, country)
          )
        )

        const exportResults = await Promise.all(
          Object.values(layerUrls.export).map((url) =>
            fetchCategoryData(url, country)
          )
        )

        setImportData(importResults)
        setExportData(exportResults)
      } catch (error) {
        console.error('Error fetching data from ArcGIS:', error)
      }
    }

    if (country) {
      fetchData()
    }
  }, [country])

  const getOption = () => {
    return {
      title: {
        text: `Plastic Import & Export (tonnes) for ${country}`,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: categories,
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
        data: ['Import', 'Export'],
      },
      series: categories.map((category, index) => ({
        name: category,
        type: 'bar',
        stack: 'ImportExport',
        data: [importData[index], exportData[index]],
        itemStyle: {
          color: ['#4E91CC', '#EB578F', '#BFD648', '#6AB044', '#F8B544'][index],
        },
      })),
    }
  }

  return (
    <ReactEcharts
      option={getOption()}
      style={{ height: '400px', width: '100%' }}
    />
  )
}

export default PlasticImportExportChart
