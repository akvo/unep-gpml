import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import useLayerInfo from '../../hooks/useLayerInfo'

const PlasticImportExportPieCharts = ({ chartType }) => {
  const router = useRouter()
  const { country } = router.query
  const { layers, loading } = useLayerInfo()

  const [data, setData] = useState([])

  const categories = [
    'plasticinPrimaryForm',
    'intermediateFormsOfPlastic',
    'finalManufacturedPlasticGoods',
    'plasticWaste',
  ]

  const categoriesTitle = [
    { plasticinPrimaryForm: 'Plastic in primary form' },
    { intermediateFormsOfPlastic: 'Intermediate forms of plastic' },
    { finalManufacturedPlasticGoods: 'Final manufactured plastic goods' },
    { plasticWaste: 'Plastic waste' },
  ]

  useEffect(() => {
    const fetchData = () => {
      if (loading || !country || !layers.length) return

      const layerMapping = {
        import: {
          plasticinPrimaryForm:
            'Plastics_in_primary_forms___weight__import__WFL1',
          intermediateFormsOfPlastic:
            'Intermediate_forms_of_plastic_weight____import__WFL1',
          finalManufacturedPlasticGoods:
            'Final_manufactured_plastics_goods___weight__import__WFL1',
          plasticWaste: 'Plastic_waste_weigth____import__WFL1',
        },
        export: {
          plasticinPrimaryForm:
            'Plastics_in_primary_forms___weight__export__WFL1',
          intermediateFormsOfPlastic:
            'Intermediate_forms_of_plastic_weight____export__WFL1',
          finalManufacturedPlasticGoods:
            'Final_manufactured_plastics_goods_weight____export__WFL1',
          plasticWaste: 'Plastic_waste_weigth____export__WFL1',
        },
      }

      const layersData = categories.map((category) => {
        const layer = layers.find(
          (layer) =>
            layer.attributes.arcgislayerId === layerMapping[chartType][category]
        )

        const countryData = layer?.attributes.ValuePerCountry.find(
          (item) => item.CountryName === country
        )
        return countryData ? countryData.Value : 0
      })

      setData(layersData)
    }

    fetchData()
  }, [country, layers, loading, chartType])

  const generatePieData = (data) => {
    const total = data.reduce((sum, value) => sum + value, 0)
    return categories.map((category, index) => ({
      name: Object.values(categoriesTitle[index])[0],
      value: data[index],
      percentage: ((data[index] / total) * 100).toFixed(2),
    }))
  }

  const pieData = generatePieData(data)

  const getPieOption = () => ({
    title: {
      text: `Plastic ${
        chartType === 'import' ? 'Import' : 'Export'
      } Distribution (tonnes) for ${country}`,
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      left: 'left',
      top: '40px',
      data: categoriesTitle.map((category) => Object.values(category)[0]),
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '40%',
      containLabel: true,
    },
    color: ['#384E85', '#FFB800', '#f56a00', '#A7AD3E', '#FFA424'],
    series: [
      {
        name: chartType === 'import' ? 'Import' : 'Export',
        type: 'pie',
        radius: '50%',
        top: '60px',
        data: pieData.map((item) => ({
          value: item.value,
          name: item.name,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: '#4E91CC',
          },
        },
      },
    ],
  })

  return (
    <ReactEcharts
      option={getPieOption()}
      style={{ height: '400px', width: '100%' }}
    />
  )
}

export default PlasticImportExportPieCharts
