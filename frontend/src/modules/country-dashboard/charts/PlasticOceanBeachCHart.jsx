import React, { useEffect, useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { useRouter } from 'next/router'
import { getBaseUrl } from '../../../utils/misc'
import { t, Trans } from '@lingui/macro'
import { splitIntoTwoLines } from './PlasticImportExportChart'

const PlasticOceanBeachChart = ({ layers, loading }) => {
  const router = useRouter()
  const baseURL = getBaseUrl()
  const { country, countryCode } = router.query
  const [oceanPercentage, setOceanPercentage] = useState(0)
  const [beachPercentage, setBeachPercentage] = useState(0)
  const [totalWeight, setTotalWeight] = useState(0)
  console.log(beachPercentage)
  useEffect(() => {
    const fetchData = () => {
      if (loading || !country || !layers.length) return

      const oceanLayer = layers.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Mismanaged_plastic_waste_escaping_to_oceans_V3_WFL1'
      )
      const coastLayer = layers.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Mismanaged_plastic_waste_escaping_to_oceans_and_coasts_V3_WFL1'
      )
      const beachLayer = layers.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Mismanaged_plastic_waste_escaping_to_beaches_V3_WFL1'
      )

      const totalWeightLayer = layers.find(
        (layer) =>
          layer.attributes.arcgislayerId ===
          'Mismanaged_plastic_waste_escaping_to_oceans_and_coasts_V3_WFL1'
      )
      if (!oceanLayer || !coastLayer || !beachLayer) {
        console.warn('One of the required layers not found.')
        return
      }

      const oceanValue =
        oceanLayer.attributes.ValuePerCountry.find((item) =>
          item.CountryCode
            ? item.CountryCode === countryCode
            : item.CountryName === decodeURIComponent(country)
        )?.Value || 0

      const coastValue =
        coastLayer.attributes.ValuePerCountry.find((item) =>
          item.CountryCode
            ? item.CountryCode === countryCode
            : item.CountryName === decodeURIComponent(country)
        )?.Value || 1
      const beachValue =
        beachLayer.attributes.ValuePerCountry.find((item) =>
          item.CountryCode
            ? item.CountryCode === countryCode
            : item.CountryName === decodeURIComponent(country)
        )?.Value || 0

      const totalWeight =
        totalWeightLayer.attributes.ValuePerCountry.find((item) =>
          item.CountryCode
            ? item.CountryCode === countryCode
            : item.CountryName === decodeURIComponent(country)
        )?.Value || 0

      const calculatedOceanPercentage = (
        (oceanValue * 100) /
        coastValue
      ).toFixed(2)
      const calculatedBeachPercentage = (
        (beachValue * 100) /
        coastValue
      ).toFixed(2)

      setOceanPercentage(calculatedOceanPercentage)
      setBeachPercentage(calculatedBeachPercentage)
      setTotalWeight(totalWeight)
    }

    fetchData()
  }, [country, layers, loading])

  const getOption = () => {
    const formattedTotalWeight = new Intl.NumberFormat('en-US').format(
      Math.round(totalWeight)
    )

    return {
      title: {
        text: splitIntoTwoLines(t`Escaped plastic reaching oceans and coasts​`),
        subtext: splitIntoTwoLines(
          t`Percentage of the escaped plastic waste between years 2010-2019`
        ),
        left: 'center',
        textStyle: {
          fontSize: window.innerWidth < 768 ? 14 : 16,
          fontWeight: 'bold',
          color: '#020A5B',
        },
        subtextStyle: {
          fontSize: window.innerWidth < 768 ? 11 : 12,
          // color: '#020A5B',
          fontFamily: 'Roboto, Helvetica Neue, sans-serif',
          // fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} %',
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: [t`Ends up in the ocean`, t`Ends up on the coasts`],
        textStyle: {
          fontSize: 12,
          color: '#020A5B',
        },
      },
      series: [
        {
          name: t`Plastic distribution`,
          type: 'pie',
          top: '15%',
          radius: ['40%', '80%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'inside',
            formatter: '{d}%',
            fontSize: 12,
            color: '#fff',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data:
            parseInt(beachPercentage) === 0 && parseInt(oceanPercentage) === 0
              ? [
                  {
                    value: 0,
                    name: t`No Data`,
                    itemStyle: '#bdc3c7',
                  },
                ]
              : [
                  {
                    value: beachPercentage,
                    name: t`Ends up on the coasts`,
                    itemStyle: {
                      color: '#ffc107',
                    },
                  },
                  {
                    value: oceanPercentage,
                    name: t`Ends up in the ocean`,
                    itemStyle: {
                      color: '#007bff',
                    },
                  },
                ],
        },
      ],
      graphic: {
        type: 'group',
        left: 'center',
        top: '50%',
        children: [
          {
            type: 'text',
            left: 'center',
            style: {
              text: `${formattedTotalWeight}`,
              fontSize: 20,
              fontWeight: 'bold',
              fill: '#020A5B',
              textAlign: 'center',
            },
          },
          {
            type: 'text',
            left: 'center',
            top: 25,
            style: {
              text: t`tonnes`,
              fontSize: 14,
              fontWeight: 'normal',
              fill: '#020A5B',
              textAlign: 'center',
            },
          },
        ],
      },
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
        <Trans> Data source: </Trans>{' '}
        <a
          href={`${baseURL}/data/maps?categoryId=environmental-impact&subcategoryId=ocean-and-coast&layer=Mismanaged_plastic_waste_escaping_to_oceans_and_coasts_V3_WFL1`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#020A5B', fontWeight: 'bold' }}
        >
          <Trans> ​​Florida State University and UNEP, 2021</Trans>
        </a>{' '}
      </div>
    </div>
  )
}

export default PlasticOceanBeachChart
