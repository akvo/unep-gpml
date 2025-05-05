import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import { t, Trans } from '@lingui/macro'

const PlasticImportExportPieCharts = ({ chartType, layers, loading }) => {
  const router = useRouter()
  const { country, countryCode } = router.query
  const [data, setData] = useState([])

  const categories = [
    'plasticinPrimaryForm',
    'intermediateFormsOfPlastic',
    'finalManufacturedPlasticGoods',
    'intermediateManufacturedPlasticGoods',
    'plasticWaste',
  ]

  const plasticinPrimaryForm = t`Plastic in primary form`
  const intermediateFormsOfPlastic = t`Intermediate forms of plastic`
  const finalManufacturedPlasticGoods = t`Final manufactured plastic goods`
  const intermediateManufacturedPlasticGoods = t`Intermediate manufactured plastic goods`
  const plasticWaste = t`Plastic waste`
  const categoriesTitle = [
    { plasticinPrimaryForm },
    { intermediateFormsOfPlastic },
    { finalManufacturedPlasticGoods },
    { intermediateManufacturedPlasticGoods },
    { plasticWaste },
  ]

  useEffect(() => {
    if (loading || !country || !layers.length) return

    const layerMapping = {
      import: {
        plasticinPrimaryForm:
          'Plastics_in_primary_forms___weight__import__WFL1',
        intermediateFormsOfPlastic:
          'Intermediate_forms_of_plastic_weight____import__WFL1',
        finalManufacturedPlasticGoods:
          'Final_manufactured_plastics_goods___weight__import__WFL1',
        intermediateManufacturedPlasticGoods:
          'Intermediate___weight__import__WFL1',

        plasticWaste: 'Plastic_waste_weigth____import__WFL1',
      },
      export: {
        plasticinPrimaryForm:
          'Plastics_in_primary_forms___weight__export__WFL1',
        intermediateFormsOfPlastic:
          'Intermediate_forms_of_plastic_weight____export__WFL1',
        finalManufacturedPlasticGoods:
          'Final_manufactured_plastics_goods_weight____export__WFL1',
        intermediateManufacturedPlasticGoods:
          'Intermediate___weight__export__WFL1',

        plasticWaste: 'Plastic_waste_weigth____export__WFL1',
      },
    }

    const fetchLayerData = () => {
      let latestYear = null

      const layersData = categories.map((category) => {
        const layer = layers.find(
          (layer) =>
            layer.attributes.arcgislayerId === layerMapping[chartType][category]
        )

        if (!layer) return 0

        const countryData = layer.attributes.ValuePerCountry?.filter((item) =>
          item.CountryCode
            ? item.CountryCode === countryCode
            : item.CountryName === decodeURIComponent(country)
        )

        if (!countryData || !countryData.length) return 0

        const latestData = countryData.reduce((latest, current) => {
          return !latest || current.Year > latest.Year ? current : latest
        }, null)

        if (latestData?.Year > latestYear || !latestYear) {
          latestYear = latestData?.Year
        }

        return latestData ? latestData.Value : 0
      })

      setData(layersData)
      setLatestYear(latestYear)
    }

    fetchLayerData()
  }, [country, layers, loading, chartType])
  const [latestYear, setLatestYear] = useState(null)

  const generatePieData = (data) => {
    const total = data.reduce((sum, value) => sum + value, 0)
    return categories.map((category, index) => ({
      name: Object.values(categoriesTitle[index])[0],
      value: data[index],
      percentage: ((data[index] / total) * 100).toFixed(0),
    }))
  }

  const pieData = generatePieData(data)
  const countryName = decodeURIComponent(country)

  const tTextTitle =
    window.innerWidth < 768
      ? chartType === 'import'
        ? t`Plastic import by type for\n${countryName}`
        : t`Plastic export by type for\n${countryName}`
      : chartType === 'import'
      ? t`Plastic import by type for ${countryName}`
      : t`Plastic export by type for ${countryName}`

  const getPieOption = () => ({
    title: {
      text: tTextTitle,
      subtext: t`In 1000 metric tons for year ${2022 || 'N/A'}`,
      left: 'center',
      textStyle: {
        fontSize: window.innerWidth < 768 ? 14 : 18,
        color: '#020A5B',
      },
      subtextStyle: {
        fontSize: 14,
        color: '#020A5B',
        fontFamily: 'Roboto, Helvetica Neue, sans-serif',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const { seriesName, name, value, percent } = params
        return `${seriesName} <br/>${name}: ${Math.round(value)} (${Math.round(
          percent
        )}%)`
      },
    },
    legend: {
      orient: 'horizontal',
      left: 'center',
      textStyle: {
        color: '#020A5B',
      },
      top: 'bottom',
      itemGap: 10,
      padding: [20, 30, 5, 10],
      data: categoriesTitle.map((category) => Object.values(category)[0]),
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '30%',
      containLabel: true,
    },
    color: ['#384E85', '#FFB800', '#f56a00', '#A7AD3E', '#3498db'],
    series: [
      {
        name: chartType === 'import' ? 'Import' : 'Export',
        type: 'pie',
        radius: '50%',
        data: pieData.map((item) => ({
          value: item.value,
          name: item.name,
        })),
        label: {
          show: false,
        },
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
    <div style={{ position: 'relative' }}>
      <ReactEcharts
        option={getPieOption()}
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
        <Trans> Data source: </Trans>{' '}
        <a
          href={`https://unctad.org/publication/global-trade-plastics-insights-first-life-cycle-trade-database`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#020A5B', fontWeight: 'bold' }}
        >
          <Trans> UNCTAD 2022</Trans>
        </a>{' '}
      </div>
    </div>
  )
}

export default PlasticImportExportPieCharts
