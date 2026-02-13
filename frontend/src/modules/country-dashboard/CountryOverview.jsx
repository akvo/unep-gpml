import React, { useEffect, useState } from 'react'
import { Row, Col, Button, Spin, Tooltip } from 'antd'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import useReplacedText from '../../hooks/useReplacePlaceholders'
import PolicyComponent from './PolicyComponents'
import RequestDataUpdateModal from './RequestDataUpdateModal'
import ChartCard from './ChartCard'
import {
  CATEGORY_IDS,
  WEIGHT_LAYER_IDS,
  COLUMN_SPLIT_MARKER,
  EXCEL_COUNTRY_CODES,
  SECTION_REGISTRY,
} from './constants'

const PlasticImportExportChart = dynamic(
  () => import('./charts/PlasticImportExportChart'),
  { ssr: false }
)
const PlasticImportExportTonnesChart = dynamic(
  () => import('./charts/PlasticImportExportTonnesChart'),
  { ssr: false }
)
const PlasticImportExportPieCharts = dynamic(
  () => import('./charts/PlasticImportExportPieChart'),
  { ssr: false }
)
const MSWGenerationChart = dynamic(
  () => import('./charts/MSWGeneration'),
  { ssr: false }
)
const PlasticOceanBeachChart = dynamic(
  () => import('./charts/PlasticOceanBeachCHart'),
  { ssr: false }
)
const PlasticCompositionChart = dynamic(
  () => import('./charts/PlasticCompositionChart'),
  { ssr: false }
)
const PlasticConsumptionChart = dynamic(
  () => import('./charts/PlasticConsumptionChart'),
  { ssr: false }
)
const TradingPartnersPieChart = dynamic(
  () => import('./charts/TradingPartnersPieChart'),
  { ssr: false }
)
const ProductCategoriesChart = dynamic(
  () => import('./charts/ProductCategoriesChart'),
  { ssr: false }
)
const TradeCompositionPieChart = dynamic(
  () => import('./charts/TradeCompositionPieChart'),
  { ssr: false }
)
const TopProductsTable = dynamic(
  () => import('./charts/TopProductsTable'),
  { ssr: false }
)
const TotalPlasticsTradeChart = dynamic(
  () => import('./charts/TotalPlasticsTradeChart'),
  { ssr: false }
)
const TradingPartnersBarChart = dynamic(
  () => import('./charts/TradingPartnersBarChart'),
  { ssr: false }
)
import Handlebars from 'handlebars'
import useCategories from '../../hooks/useCategories'
import SectionText from './sections/SectionText'
import KeyTrends from './sections/KeyTrends'
import LifeCycleInsights from './sections/LifeCycleInsights'
import parse from 'html-react-parser'
import styles from './CountryOverview.module.scss'
import { t } from '@lingui/macro'

import useLayerInfo from '../../hooks/useLayerInfo'
import { getBaseUrl } from '../../utils/misc'

// Section components for the one-pager
import ProductionSection from './sections/ProductionSection'
import TradeSection from './sections/TradeSection'
import ConsumptionSection from './sections/ConsumptionSection'
import WasteManagementSection from './sections/WasteManagementSection'
import EnvironmentSection from './sections/EnvironmentSection'
import LifeCycleInsightsSection from './sections/LifeCycleInsightsSection'

const SECTION_COMPONENTS = {
  production: ProductionSection,
  trade: TradeSection,
  consumption: ConsumptionSection,
  'waste-management': WasteManagementSection,
  environment: EnvironmentSection,
  'life-cycle-insights': LifeCycleInsightsSection,
}

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

  return [...new Set([...WEIGHT_LAYER_IDS, ...cleanedFields])]
}

const splitTextInHalf = (text, splitMarker = '') => {
  if (splitMarker && text.includes(splitMarker)) {
    const parts = text.split(splitMarker)
    return [parts[0].trim(), parts.slice(1).join(splitMarker).trim()]
  }
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

const CountryOverview = ({
  countryFileData,
  countryDataLoading,
  availableSections,
  registerRef,
}) => {
  const router = useRouter()
  const { query } = router
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const { categories } = useCategories()
  const { layers, loading: layerLoading } = useLayerInfo()
  const baseURL = getBaseUrl()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const countryData = countryFileData?.sheets || null
  const textContent = countryFileData?.text || null

  const isExcelCountry = EXCEL_COUNTRY_CODES.includes(router.query.countryCode)

  const selectedCategoryObject = categories.find(
    (c) => c.attributes.categoryId == router.query.categoryId
  )

  const [isModalVisible, setModalVisible] = useState(false)

  const showModal = () => {
    setModalVisible(true)
  }

  const handleClose = () => {
    setModalVisible(false)
  }

  const uniqueLayerIds = isExcelCountry
    ? []
    : [
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
    l.attributes.ValuePerCountry.some(
      (vpc) =>
        vpc.CountryCode === router.query.countryCode ||
        vpc.CountryName === router.query.country
    )
  )
  const layerJson = JSON.stringify(filteredByCountry)

  const { placeholders, tooltips, loading } = useReplacedText(
    router.query.country,
    router.query.countryCode,
    isExcelCountry ? null : router.query.categoryId,
    isExcelCountry ? [] : selectedCategoryObject?.attributes?.textTemplate?.placeholders,
    layerJson
  )

  // Excel countries: one-pager with all sections
  if (isExcelCountry) {
    if (countryDataLoading) {
      return (
        <div className={styles.spinner}>
          <Spin tip="Loading data..." size="large" />
        </div>
      )
    }

    const countryName = decodeURIComponent(router.query.country || '')

    const headerRow = (
      <Row className={styles.headerRow}>
        <Col>
          <div>
            <span className={styles.titleCategory}>{countryName}</span>
          </div>
        </Col>
        {!isMobile && (
          <Col className={styles.containerButton}>
            <Tooltip title="Update country data by sending a request to the GPML Data Hub team.">
              <Button
                className={styles.buttonStyle}
                onClick={showModal}
                style={{ width: '100%' }}
              >
                {t`Submit Data Update`}
              </Button>
              <RequestDataUpdateModal
                visible={isModalVisible}
                onClose={handleClose}
              />
            </Tooltip>
          </Col>
        )}
      </Row>
    )

    return (
      <div className={styles.text}>
        {headerRow}

        {(availableSections || []).map((section) => {
          const Component = SECTION_COMPONENTS[section.key]
          if (!Component) return null
          return (
            <Component
              key={section.key}
              ref={(el) => registerRef && registerRef(section.key, el)}
              textContent={textContent}
              countryData={countryData}
              countryName={countryName}
            />
          )
        })}

        {isMobile && (
          <div className={styles.mobileButtonsContainer}>
            <Button className={styles.buttonStyle} onClick={showModal}>
              {t`Submit Data Update`}
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Non-Excel (Strapi) countries: original categoryId-based rendering
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
    selectedCategoryObject?.attributes?.categoryId === CATEGORY_IDS.ENVIRONMENTAL_IMPACT ||
    selectedCategoryObject?.attributes?.categoryId === CATEGORY_IDS.WASTE_MANAGEMENT
      ? splitTextByMarker(categoryText, COLUMN_SPLIT_MARKER)
      : splitTextInHalf(categoryText || '', COLUMN_SPLIT_MARKER)

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
    const categoryId = selectedCategory || router?.query?.categoryId
    if (categoryId) {
      window.location.href = `${baseURL}/data/maps?categoryId=${categoryId}`
    } else {
      alert('Please select a category before viewing global data.')
    }
  }

  return (
    <div className={styles.text}>
      <Row className={styles.headerRow}>
        <Col>
          <div>
            <span className={styles.titleCategory}>
              {selectedCategoryObject?.attributes?.name || ''}
            </span>
          </div>
        </Col>

        {!isMobile && (
          <Col className={styles.containerButton}>
            <Tooltip title="Update country data by sending a request to the GPML Data Hub team.">
              <Button
                className={styles.buttonStyle}
                onClick={showModal}
                style={{ width: '100%' }}
              >
                {t`Submit Data Update`}
              </Button>
              <RequestDataUpdateModal
                visible={isModalVisible}
                onClose={handleClose}
              />
            </Tooltip>
          </Col>
        )}
      </Row>

      {router.query.categoryId !== CATEGORY_IDS.OVERVIEW &&
      router.query.categoryId !== CATEGORY_IDS.GOVERNANCE_AND_REGULATIONS ? (
        <Row gutter={[16, 16]} className={styles.chartRow}>
          <Col xs={24} md={12}>
            <div className={styles.textColumn}>
              {textWithTooltipsfirstHalfText}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className={styles.textColumn}>
              {textWithTooltipsfirstSecondText}
            </div>
          </Col>
        </Row>
      ) : (
        <Row className={styles.chartRow}>
          <p className={styles.governanceText}>{governanceText}</p>
        </Row>
      )}

      {router.query.categoryId === CATEGORY_IDS.INDUSTRY_AND_TRADE && (
        <>
          <Row className={styles.chartRow}>
            <Col span={24}>
              <div className={styles.plasticImportChart}>
                <PlasticImportExportChart
                  layers={layers}
                  loading={layerLoading}
                />
              </div>
            </Col>
          </Row>
          <Row className={styles.chartRow}>
            <Col span={24}>
              <ChartCard>
                <PlasticImportExportTonnesChart
                  layers={layers}
                  loading={layerLoading}
                />
              </ChartCard>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <ChartCard>
                <PlasticImportExportPieCharts
                  chartType="import"
                  layers={layers}
                  loading={layerLoading}
                />
              </ChartCard>
            </Col>
            <Col xs={24} md={12}>
              <ChartCard>
                <PlasticImportExportPieCharts
                  chartType="export"
                  layers={layers}
                  loading={layerLoading}
                />
              </ChartCard>
            </Col>
          </Row>

          {countryData && (
            <>
              {textContent?.trade?.summary && (
                <Row className={styles.sectionRowTop}>
                  <Col span={24}>
                    <SectionText
                      template={textContent.trade.summary}
                      placeholders={placeholders}
                    />
                  </Col>
                </Row>
              )}

              <Row className={styles.chartRow}>
                <Col span={24}>
                  <ChartCard>
                    <PlasticConsumptionChart countryData={countryData} />
                  </ChartCard>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className={styles.chartRow}>
                <Col xs={24} md={12}>
                  <ChartCard>
                    <TradingPartnersPieChart
                      countryData={countryData}
                      type="import"
                    />
                  </ChartCard>
                </Col>
                <Col xs={24} md={12}>
                  <ChartCard>
                    <TradingPartnersPieChart
                      countryData={countryData}
                      type="export"
                    />
                  </ChartCard>
                </Col>
              </Row>

              <Row className={styles.chartRow}>
                <Col span={24}>
                  <ChartCard>
                    <ProductCategoriesChart countryData={countryData} />
                  </ChartCard>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className={styles.chartRow}>
                <Col xs={24} md={12}>
                  <ChartCard>
                    <TradeCompositionPieChart
                      countryData={countryData}
                      type="import"
                    />
                  </ChartCard>
                </Col>
                <Col xs={24} md={12}>
                  <ChartCard>
                    <TradeCompositionPieChart
                      countryData={countryData}
                      type="export"
                    />
                  </ChartCard>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className={styles.chartRow}>
                <Col xs={24} md={12}>
                  <ChartCard>
                    <TopProductsTable
                      countryData={countryData}
                      type="import"
                    />
                  </ChartCard>
                </Col>
                <Col xs={24} md={12}>
                  <ChartCard>
                    <TopProductsTable
                      countryData={countryData}
                      type="export"
                    />
                  </ChartCard>
                </Col>
              </Row>
            </>
          )}
        </>
      )}

      {router.query.categoryId === CATEGORY_IDS.WASTE_MANAGEMENT && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <ChartCard>
                <MSWGenerationChart layers={layers} layerLoading={layerLoading} />
              </ChartCard>
            </Col>
            <Col xs={24} md={12}>
              <ChartCard>
                <PlasticCompositionChart
                  layers={layers}
                  layerLoading={layerLoading}
                />
              </ChartCard>
            </Col>
          </Row>
          {textContent?.wasteManagement?.content && (
            <Row className={styles.sectionRowTop}>
              <Col span={24}>
                <SectionText
                  template={textContent.wasteManagement.content}
                  placeholders={placeholders}
                />
              </Col>
            </Row>
          )}
        </>
      )}

      {router.query.categoryId === CATEGORY_IDS.GOVERNANCE_AND_REGULATIONS && (
        <Col span={24}>
          <PolicyComponent layers={layers} layerLoading={layerLoading} />
        </Col>
      )}

      {router.query.categoryId === CATEGORY_IDS.ENVIRONMENTAL_IMPACT && (
        <>
          <ChartCard className={styles.chartCardPadded}>
            <PlasticOceanBeachChart layers={layers} layerLoading={layerLoading} />
          </ChartCard>
          {textContent?.environment?.content && (
            <Row className={styles.sectionRowTop}>
              <Col span={24}>
                <SectionText
                  template={textContent.environment.content}
                  placeholders={placeholders}
                />
              </Col>
            </Row>
          )}
        </>
      )}

      {isMobile && (
        <div className={styles.mobileButtonsContainer}>
          <Button className={styles.buttonStyle} onClick={showModal}>
            {t`Submit Data Update`}
          </Button>
        </div>
      )}

      {router?.query?.categoryId && router?.query?.country && isMobile && (
        <div>
          <Button
            className={styles.globalButton}
            onClick={handleViewGlobalDataClick}
          >
            {t`View Global Data `} →
          </Button>
        </div>
      )}
    </div>
  )
}

export default CountryOverview
