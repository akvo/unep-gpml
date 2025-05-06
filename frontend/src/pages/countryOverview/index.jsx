import React, { useEffect, useState } from 'react'
import { Row, Col, Button, Spin, Tooltip } from 'antd'
import { useRouter } from 'next/router'
import useReplacedText from '../../hooks/useReplacePlaceholders'
import PlasticImportExportChart from '../../modules/country-dashboard/charts/PlasticImportExportChart'
import PlasticImportExportTonnesChart from '../../modules/country-dashboard/charts/PlasticImportExportTonnesChart'
import PlasticImportExportPieCharts from '../../modules/country-dashboard/charts/PlasticImportExportPieChart'
import MSWGenerationChart from '../../modules/country-dashboard/charts/MSWGeneration'
import PlasticOceanBeachChart from '../../modules/country-dashboard/charts/PlasticOceanBeachCHart'
import PolicyComponent from './PolicyComponents'
import RequestDataUpdateModal from './RequestDataUpdateModal'
import PlasticCompositionChart from '../../modules/country-dashboard/charts/PlasticCompositionChart'
import Handlebars from 'handlebars'
import useCategories from '../../hooks/useCategories'
import parse from 'html-react-parser'
import styles from './index.module.scss'
import { t } from '@lingui/macro'
import axios from 'axios'

import useLayerInfo from '../../hooks/useLayerInfo'
import { UIStore } from '../../store'
import useQueryParameters from '../../hooks/useQueryParameters'
import { getBaseUrl, getStrapiUrl } from '../../utils/misc'
import { loadCatalog } from '../../translations/utils'

export function cleanArcGisFields(fields) {
  if (!fields) return []

  let cleanedFields = fields.filter((field) => !field.includes('='))

  const unwantedValues = ['importTrend', 'country']
  cleanedFields = cleanedFields.filter(
    (field) => !unwantedValues.includes(field.trim())
  )

  cleanedFields = cleanedFields.map((field) =>
    field
      .replace(/(_total|_last|_first|_city)$/, '')
      .replace(/_year_first$/, '')
      .replace(/_year_last$/, '')
      .replace(/_year$/, '')
      .trim()
  )

  cleanedFields = cleanedFields.filter((field) => field !== '')

  return [...new Set(cleanedFields)]
}

const splitTextInHalf = (text) => {
  const exportsIndex = text.indexOf(
    "<strong style='font-size: 20px; color: #6236FF;'>Plastic exports</strong>"
  )
  if (exportsIndex !== -1) {
    const firstHalf = text.slice(0, exportsIndex).trim()
    const secondHalf = text.slice(exportsIndex).trim()
    return [firstHalf, secondHalf]
  }

  const words = text.split(' ')
  const halfIndex = Math.ceil(words.length / 2)
  const firstHalf = words.slice(0, halfIndex).join(' ')
  const secondHalf = words.slice(halfIndex).join(' ')
  return [firstHalf, secondHalf]
}

const splitTextByMarker = (text, marker) => {
  const [firstPart, secondPart] = text.split(marker)
  return [firstPart?.trim(), secondPart?.trim()]
}

const addTooltipsToPlaceholders = (htmlString, placeholders, tooltips) => {
  if (!placeholders || Object.keys(placeholders).length === 0) return htmlString

  const options = {
    replace: (node) => {
      if (node.name === 'placeholder' && node.attribs?.key) {
        const placeholderKey = node.attribs.key
        const placeholderValue = placeholders[placeholderKey]

        return (
          <Tooltip
            title={tooltips[placeholderKey]}
            overlayInnerStyle={{
              backgroundColor: '#fff',
              color: '#020A5B',
              borderRadius: '4px',
            }}
          >
            <span
              style={{
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {placeholderValue}
            </span>
          </Tooltip>
        )
      }

      return undefined
    },
  }

  return parse(htmlString, options)
}
const CountryOverview = () => {
  const router = useRouter()
  const { queryParameters, setQueryParameters } = useQueryParameters()
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const { categories } = useCategories()
  const { layers, loading: layerLoading } = useLayerInfo()
  const baseURL = getBaseUrl()
  const strapiURL = getStrapiUrl()
  const { countries } = UIStore.useState((s) => ({
    countries: s.countries,
  }))

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const postDataLayers = async (layers) => {
    console.log(layers)
    if (!layers || layers.length === 0) return
    try {
      const weightPayload = {
        outFields: ['Year', 'Value', 'Country'],
      }
      const valuePayload = {
        outFields: ['Time', 'Value', 'Country'],
      }
      const obsPayload = {
        outFields: ['Time_Perio', 'OBS_Value', 'Country'],
      }

      for (let index = 0; index < layers.length; index++) {
        if ('Plastic_packaging___weight__import__WFL1' === layers[index]) {
          await axios.post(
            `${strapiURL}/api/countries/populate-data-layers/${layers[index]}`,
            obsPayload
          )
        } else if (
          layers[index].toLowerCase().includes('value') ||
          layers[index].toLowerCase().includes('total')
        ) {
          // console.log(
          //   `${strapiURL}/api/countries/populate-data-layers/${layers[index]}`,
          //   valuePayload
          // )
          await axios.post(
            `${strapiURL}/api/countries/populate-data-layers/${layers[index]}`,
            valuePayload
          )
        } else {
          // console.log(
          //   `${strapiURL}/api/countries/populate-data-layers/${layers[index]}`,
          //   weightPayload)

          await axios.post(
            `${strapiURL}/api/countries/populate-data-layers/${layers[index]}`,
            weightPayload
          )
        }
      }
    } catch (error) {
      console.error('Error fetching Layers:', error)
    }
  }

  useEffect(() => {
    if (queryParameters.country) {
      setSelectedCountry(queryParameters.country)
    }
  }, [queryParameters])

  const selectedCategoryObject = categories.find(
    (c) => c.attributes.categoryId == router.query.categoryId
  )
  // const cleanedFields = cleanArcGisFields(
  //   selectedCategoryObject?.attributes?.textTemplate?.placeholders
  // )
  // console.log(cleanedFields)
  useEffect(() => {
    if (queryParameters.addData) {
      const cleanedFields = cleanArcGisFields(
        selectedCategoryObject?.attributes?.textTemplate?.placeholders
      )
      postDataLayers(cleanedFields)
    }
  }, [queryParameters, selectedCategoryObject])

  const [isModalVisible, setModalVisible] = useState(false)

  const showModal = () => {
    setModalVisible(true)
  }

  const handleClose = () => {
    setModalVisible(false)
  }

  const uniqueLayerIds = [
    ...new Set(
      selectedCategoryObject?.attributes?.textTemplate?.placeholders.map(
        (placeholder) =>
          placeholder
            .split('=')[0]
            .split(/(_year|_total|_last|_first|_city|\*|\/|\+|\-)/)[0]
            .trim()
      )
    ),
  ]

  const filteredLayers = layers.filter((layer) =>
    uniqueLayerIds.includes(layer.attributes.arcgislayerId)
  )

  const filteredByCountry = filteredLayers.filter((l) =>
    l.attributes.ValuePerCountry.filter(
      (vpc) =>
        vpc.CountryCode === router.query.countryCode ||
        vpc.CountryName === router.query.country
    )
  )
  const layerJson = JSON.stringify(filteredByCountry)

  const { placeholders, tooltips, loading } = useReplacedText(
    router.query.country,
    router.query.countryCode,
    router.query.categoryId,
    selectedCategoryObject?.attributes?.textTemplate?.placeholders,
    layerJson
  )

  if (loading || layerLoading || !selectedCategoryObject) {
    return (
      <div className={styles.spinner}>
        <Spin tip="Loading data..." size="large" />
      </div>
    )
  }
  const importTrend =
    placeholders['importIncreasePercentage'] > 0 ? 'increased' : 'decreased'
  placeholders['importTrend'] = importTrend

  const exportTrend =
    placeholders['exportIncreasePercentage'] > 0 ? 'increased' : 'decreased'
  placeholders['exportTrend'] = exportTrend

  const importIncreaseValue = placeholders['importIncreasePercentage']
  const exportIncreaseValue = placeholders['exportIncreasePercentage']

  placeholders['importIncreasePercentage'] = Math.abs(
    importIncreaseValue
  ).toFixed(1)
  placeholders['exportIncreasePercentage'] = Math.abs(
    exportIncreaseValue
  ).toFixed(1)

  const wrapPlaceholders = (template) => {
    return template.replace(/{{(.*?)}}/g, (match, placeholder) => {
      const nonBreakingPlaceholder =
        placeholder === 'country' && !template.trim().startsWith('Estimated')
          ? `<placeholder key="${placeholder}" style="white-space: nowrap;"> {{country}} </placeholder>`
          : `<placeholder key="${placeholder}">${match}</placeholder>`
      return nonBreakingPlaceholder
    })
  }

  const rawTemplate =
    selectedCategoryObject?.attributes?.textTemplate?.template || ''
  const wrappedTemplate = wrapPlaceholders(rawTemplate)

  const compiledTemplate = Handlebars.compile(wrappedTemplate, {
    noEscape: true,
  })
  const categoryText = compiledTemplate({
    ...placeholders,
    country: `{{country}}`,
  })

  const [firstHalfText, secondHalfText] =
    selectedCategoryObject?.attributes?.categoryId === 'environmental-impact' ||
    selectedCategoryObject?.attributes?.categoryId === 'waste-management'
      ? splitTextByMarker(categoryText, '<!--NEW_COLUMN-->')
      : splitTextInHalf(categoryText || '')

  const textWithTooltipsfirstHalfText = addTooltipsToPlaceholders(
    firstHalfText,
    placeholders,
    tooltips
  )
  const textWithTooltipsfirstSecondText = addTooltipsToPlaceholders(
    secondHalfText,
    placeholders,
    tooltips
  )

  const governanceText = addTooltipsToPlaceholders(
    categoryText,
    placeholders,
    tooltips
  )

  const handleViewGlobalDataClick = () => {
    const categoryId = selectedCategory || queryParameters.categoryId
    if (categoryId) {
      window.location.href = `${baseURL}/data/maps?categoryId=${categoryId}`
    } else {
      alert('Please select a category before viewing global data.')
    }
  }

  return (
    <div className={styles.text}>
      <Row className={styles.headerRow}>
        <Col xs={24} md={18}>
          <div>
            <span className={styles.titleCountry}>
              {decodeURIComponent(router.query.country)?.toUpperCase()}
            </span>
          </div>
        </Col>

        {!isMobile && (
          <Col xs={24} md={6} className={styles.containerButton}>
            <span className={styles.textButton}>
              <span className={styles.dot}></span>
              Page last updated: 02-20-22
            </span>
            <Tooltip title="Update country data by sending a request to the GPML Data Hub team.">
              <Button
                className={styles.buttonStyle}
                onClick={showModal}
                style={{ width: '100%' }}
              >
                {t`Request Data Update`}
              </Button>
              <RequestDataUpdateModal
                visible={isModalVisible}
                onClose={handleClose}
              />
            </Tooltip>
          </Col>
        )}
      </Row>

      {router.query.categoryId !== 'overview' &&
      router.query.categoryId !== 'governance-and-regulations' ? (
        <Row gutter={[16, 16]} style={{ marginBottom: '40px' }}>
          <Col xs={24} md={12}>
            <div style={{ fontSize: '16px', color: '#1B2738' }}>
              {textWithTooltipsfirstHalfText}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ fontSize: '16px', color: '#1B2738' }}>
              {textWithTooltipsfirstSecondText}
            </div>
          </Col>
        </Row>
      ) : (
        <Row style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '16px', color: '#1B2738' }}>{governanceText}</p>
        </Row>
      )}

      {router.query.categoryId === 'industry-and-trade' && (
        <>
          <Row style={{ marginBottom: '40px' }}>
            <Col span={24}>
              <div className={styles.plasticImportChart}>
                <PlasticImportExportChart
                  layers={layers}
                  loading={layerLoading}
                />
              </div>
            </Col>
          </Row>
          <Row style={{ marginBottom: '40px' }}>
            <Col span={24}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <PlasticImportExportTonnesChart
                  layers={layers}
                  loading={layerLoading}
                />
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <PlasticImportExportPieCharts
                  chartType="import"
                  layers={layers}
                  loading={layerLoading}
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <PlasticImportExportPieCharts
                  chartType="export"
                  layers={layers}
                  loading={layerLoading}
                />
              </div>
            </Col>
          </Row>
        </>
      )}

      {router.query.categoryId === 'waste-management' && (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <MSWGenerationChart layers={layers} layerLoading={layerLoading} />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <PlasticCompositionChart
                layers={layers}
                layerLoading={layerLoading}
              />
            </div>
          </Col>
        </Row>
      )}

      {router.query.categoryId === 'governance-and-regulations' && (
        <Col span={24}>
          <PolicyComponent layers={layers} layerLoading={layerLoading} />
        </Col>
      )}

      {router.query.categoryId === 'environmental-impact' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <PlasticOceanBeachChart layers={layers} layerLoading={layerLoading} />
        </div>
      )}
      {isMobile && (
        <div className={styles.mobileButtonsContainer}>
          <Button className={styles.buttonStyle} onClick={showModal}>
            {t`Submit Data Update`}
          </Button>
        </div>
      )}

      {queryParameters.categoryId && queryParameters.country && isMobile && (
        <div>
          <Button
            className={styles.globalButton}
            onClick={handleViewGlobalDataClick}
          >
            View Global Data →
          </Button>
        </div>
      )}
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

export default CountryOverview
