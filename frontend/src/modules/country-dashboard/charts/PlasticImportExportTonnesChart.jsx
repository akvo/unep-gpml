import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import { t, Trans } from '@lingui/macro'
import { loadCatalog } from '../../../translations/utils'
import { splitIntoTwoLines} from './PlasticImportExportChart'
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

  const textTitle = splitIntoTwoLines(t`Plastic import & export value for ${decodeURIComponent(country)}`)

  const subTitle = splitIntoTwoLines(t`in million US dollars for year ${2022 || 'N/A'}`)
  const units = t`million US dollars`
  const fUnits = units.replace(/  /, '\n')
  const getOption = () => ({
    title: {
      text: textTitle,
      subtext: subTitle,
      textStyle: {
        fontSize: window.innerWidth < 768 ? 14 : 18,
        fontWeight: 'bold',
        color: '#020A5B',
      },
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
      bottom: window.innerWidth < 768 ? 'auto' : 0,
      top: window.innerWidth < 768 ? 70 : 'auto',
      orient: window.innerWidth < 768 ? 'vertical' : 'horizontal',
      left: window.innerWidth < 768 ? 'left' : 'auto',
      itemGap: window.innerWidth < 768 ? 5 : 10,
    },
    grid: {
      top: window.innerWidth < 768 ? 220 : 80,
      left: '3%',
      right: '4%',
      textStyle: { color: '#020A5B' },
      bottom: window.innerWidth < 768 ? 10 : '20%',
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
      name: fUnits,
      axisLabel: {
        formatter: '{value} ',
        fontSize: 12,
        color: '#020A5B',
      },
      nameTextStyle: {
        color: '#020A5B',
        fontSize: 12,
      },
      data: [t`Export`,t`Import`],
    },
    series: categories.map((category, index) => ({
      name: Object.values(categoriesTitle[index])[0],
      type: 'bar',
      stack: 'ImportExport',
      data: [exportData[index],importData[index]],
      barWidth: window.innerWidth < 768 ? 50 : 90,
      itemStyle: {
        color: ['#384E85', '#FFB800', '#f56a00', '#A7AD3E', '#3498db'][index],
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
        <Trans>Data source: </Trans>{' '}
        <a
          href={`https://unctad.org/publication/global-trade-plastics-insights-first-life-cycle-trade-database`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#020A5B', fontWeight: 'bold' }}
        >
          UNCTAD 2022
        </a>{' '}
      </div>
    </div>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default PlasticImportExportChart
