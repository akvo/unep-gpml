import React, { useEffect, useState } from 'react'
import { Row, Col, Button, Spin } from 'antd'
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
import { Tooltip } from 'antd'
import useLayerInfo from '../../hooks/useLayerInfo'
import styles from './index.module.scss'
import { t } from '@lingui/macro'

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

  console.log('run build')

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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const categories = useCategories()
  const { layers, loading: layerLoading } = useLayerInfo()

  const selectedCategory = categories.categories.find(
    (c) => c.attributes.categoryId == router.query.categoryId
  )

  const [isModalVisible, setModalVisible] = useState(false)

  const showModal = () => {
    setModalVisible(true)
  }

  const handleClose = () => {
    setModalVisible(false)
  }

  const uniqueLayerIds = [
    ...new Set(
      selectedCategory?.attributes?.textTemplate?.placeholders.map(
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
    selectedCategory?.attributes?.textTemplate?.placeholders,
    layerJson
  )

  if (loading || layerLoading || !selectedCategory) {
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

  const wrapPlaceholders = (template) => {
    return template.replace(/{{(.*?)}}/g, (match, placeholder) => {
      const nonBreakingPlaceholder =
        placeholder === 'country' && !template.trim().startsWith('Estimated')
          ? `<placeholder key="${placeholder}" style="white-space: nowrap;"> {{country}} </placeholder>`
          : `<placeholder key="${placeholder}">${match}</placeholder>`
      return nonBreakingPlaceholder
    })
  }

  const rawTemplate = selectedCategory?.attributes?.textTemplate?.template || ''
  const wrappedTemplate = wrapPlaceholders(rawTemplate)

  const compiledTemplate = Handlebars.compile(wrappedTemplate, {
    noEscape: true,
  })
  const categoryText = compiledTemplate({
    ...placeholders,
    country: `{{country}}`,
  })

  const [firstHalfText, secondHalfText] =
    selectedCategory?.attributes?.categoryId === 'environmental-impact' ||
    selectedCategory?.attributes?.categoryId === 'waste-management'
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

  return (
    <div
      style={{
        maxWidth: isMobile ? '90%' : '70%',
        margin: '0 auto',
        padding: '16px',
      }}
    >
      <Row className="header-row" style={{ marginBottom: '20px' }}>
        <Col xs={24} md={18}>
          <div style={{ marginBottom: '10px' }}>
            <span
              style={{ color: '#6236FF', fontSize: '24px', fontWeight: 'bold' }}
            >
              {decodeURIComponent(router.query.country)?.toUpperCase()}
            </span>
          </div>
        </Col>
        <Col xs={24} md={6} style={{ textAlign: 'center' }}>
          <span
            style={{
              color: '#7C7C7C',
              marginRight: '140px',
              fontSize: isMobile ? '12px' : '14px',
            }}
          >
            <span
              style={{
                backgroundColor: '#8E44AD',
                borderRadius: '50%',
                width: '8px',
                height: '8px',
                display: 'inline-block',
                marginRight: '5px',
              }}
            ></span>
            {t`Request Data Update`} 02-20-22
          </span>
          <Tooltip title="Update country data by sending a request to the GPML Data Hub team.">
            <Button
              onClick={showModal}
              style={{
                backgroundColor: '#00f1bf',
                textAlign: 'center',
                height: '34px',
                width: '237px',
                borderColor: '#00f1bf',
                color: '#020A5B',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {t`Request Data Update`}             
            </Button>
            <RequestDataUpdateModal
              visible={isModalVisible}
              onClose={handleClose}
            />
          </Tooltip>
        </Col>
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
        <Row style={{ marginBottom: '40px', width: '100%' }}>
          <p style={{ fontSize: '16px', color: '#1B2738' }}>{governanceText}</p>
        </Row>
      )}

      {router.query.categoryId === 'industry-and-trade' && (
        <>
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
