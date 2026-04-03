import React, { useEffect, useMemo, useState } from 'react'
import { Button, Spin, Tooltip } from 'antd'
import { useRouter } from 'next/router'
import useReplacedText from '../../hooks/useReplacePlaceholders'
import RequestDataUpdateModal from './RequestDataUpdateModal'
import {
  CATEGORY_IDS,
  COLUMN_SPLIT_MARKER,
  EXCEL_COUNTRY_CODES,
} from './constants'

import Handlebars from 'handlebars'
import parse from 'html-react-parser'
import styles from './CountryOverview.module.scss'
import { t } from '@lingui/macro'

import useLayerInfo from '../../hooks/useLayerInfo'
import useCategories from '../../hooks/useCategories'

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

const TRADE_HEADINGS = ['plastic imports', 'plastic exports', 'plastic trade trends']

const tradeHeadingStyle = {
  fontFamily: "'DM Sans', sans-serif",
  color: '#7468FF',
  fontSize: '24px',
  fontWeight: 700,
  lineHeight: '30px',
}

const splitTextInHalf = (text, splitMarker = '') => {
  if (splitMarker && text.includes(splitMarker)) {
    const parts = text.split(splitMarker)
    return [parts[0].trim(), parts.slice(1).join(splitMarker).trim()]
  }
  const exportsRegex = /<(?:strong|h3)[^>]*>Plastic exports<\/(?:strong|h3)>/i
  const match = text.match(exportsRegex)
  if (match) {
    const exportsIndex = match.index
    return [text.slice(0, exportsIndex).trim(), text.slice(exportsIndex).trim()]
  }
  const words = text.split(' ')
  const halfIndex = Math.ceil(words.length / 2)
  return [words.slice(0, halfIndex).join(' '), words.slice(halfIndex).join(' ')]
}

const splitTextByMarker = (text, marker) => {
  const [firstPart, secondPart] = text.split(marker)
  return [firstPart?.trim(), secondPart?.trim()]
}

const addTooltipsToPlaceholders = (htmlString, placeholders, tooltips, { convertHeadings = false } = {}) => {
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
                color: '#6236FF',
                cursor: 'pointer',
              }}
            >
              {placeholderValue}
            </span>
          </Tooltip>
        )
      }

      if (
        convertHeadings &&
        (node.name === 'strong' || node.name === 'b') &&
        node.children?.length
      ) {
        const text = node.children.map((c) => c.data || '').join('').trim()
        if (TRADE_HEADINGS.includes(text.toLowerCase())) {
          return <h4 style={tradeHeadingStyle}>{text}</h4>
        }
      }

      return undefined
    },
  }

  return parse(htmlString, options)
}

const wrapPlaceholders = (template) => {
  return template.replace(/{{(.*?)}}/g, (match, placeholder) => {
    const nonBreakingPlaceholder =
      placeholder === 'country' && !template.trim().startsWith('Estimated')
        ? `<placeholder key="${placeholder}" style="white-space: nowrap;"> {{country}} </placeholder>`
        : `<placeholder key="${placeholder}">${match}</placeholder>`
    return nonBreakingPlaceholder
  })
}

// Helper: extract unique ArcGIS layer IDs from a Strapi category object
const extractLayerIds = (categoryObject) => {
  if (!categoryObject?.attributes?.textTemplate?.placeholders) return []
  return [
    ...new Set(
      categoryObject.attributes.textTemplate.placeholders.map(
        (placeholder) =>
          placeholder
            .split('=')[0]
            .split(/(_year|_total|_last|_first|_city|\*|\/|\+|\-)/)[0]
            .trim()
      )
    ),
  ]
}

// Helper: filter layers by IDs and country
const filterLayersByCountry = (layers, layerIds, countryCode, countryName) => {
  const filtered = layers.filter((layer) =>
    layerIds.includes(layer.attributes.arcgislayerId)
  )
  return JSON.stringify(
    filtered.filter((l) =>
      l.attributes.ValuePerCountry?.some(
        (vpc) =>
          vpc.CountryCode === countryCode ||
          vpc.CountryName === countryName
      )
    )
  )
}

// Helper: compile a Strapi template and split into two columns
const buildStrapiSectionContent = (
  categoryObject,
  placeholdersData,
  tooltipsData,
  countryName,
  splitFn
) => {
  if (!categoryObject || Object.keys(placeholdersData).length === 0) return null

  const processedPlaceholders = { ...placeholdersData }
  const rawTemplate =
    categoryObject.attributes?.textTemplate?.template || ''
  const wrappedTemplate = wrapPlaceholders(rawTemplate)
  const compiledTemplate = Handlebars.compile(wrappedTemplate, {
    noEscape: true,
  })
  const categoryText = compiledTemplate({
    ...processedPlaceholders,
    country: countryName,
  })

  const [firstHalf, secondHalf] = splitFn(categoryText)

  return {
    firstHalf: addTooltipsToPlaceholders(
      firstHalf,
      processedPlaceholders,
      tooltipsData
    ),
    secondHalf: secondHalf
      ? addTooltipsToPlaceholders(
          secondHalf,
          processedPlaceholders,
          tooltipsData
        )
      : null,
    text: addTooltipsToPlaceholders(
      categoryText,
      processedPlaceholders,
      tooltipsData
    ),
  }
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
  const { categories } = useCategories()
  const { layers, loading: layerLoading } = useLayerInfo()

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
  const isExcelCountry = EXCEL_COUNTRY_CODES.includes(query.countryCode)
  const countryName = decodeURIComponent(query.country || '')

  const [isModalVisible, setModalVisible] = useState(false)
  const showModal = () => setModalVisible(true)
  const handleClose = () => setModalVisible(false)

  // --- Strapi category objects (memoized to stabilize references) ---
  const tradeCategoryObject = useMemo(
    () => categories.find((c) => c.attributes.categoryId === CATEGORY_IDS.INDUSTRY_AND_TRADE),
    [categories]
  )
  const wasteCategoryObject = useMemo(
    () => categories.find((c) => c.attributes.categoryId === CATEGORY_IDS.WASTE_MANAGEMENT),
    [categories]
  )
  const envCategoryObject = useMemo(
    () => categories.find((c) => c.attributes.categoryId === CATEGORY_IDS.ENVIRONMENTAL_IMPACT),
    [categories]
  )

  // --- Layer filtering per category (memoized to prevent re-fetch cascade) ---
  const tradeLayerJson = useMemo(
    () => filterLayersByCountry(layers, extractLayerIds(tradeCategoryObject), query.countryCode, query.country),
    [layers, tradeCategoryObject, query.countryCode, query.country]
  )
  const wasteLayerJson = useMemo(
    () => filterLayersByCountry(layers, !isExcelCountry ? extractLayerIds(wasteCategoryObject) : [], query.countryCode, query.country),
    [layers, wasteCategoryObject, isExcelCountry, query.countryCode, query.country]
  )
  const envLayerJson = useMemo(
    () => filterLayersByCountry(layers, !isExcelCountry ? extractLayerIds(envCategoryObject) : [], query.countryCode, query.country),
    [layers, envCategoryObject, isExcelCountry, query.countryCode, query.country]
  )

  // --- Memoize placeholder arrays to stabilize references ---
  const tradePlaceholderKeys = useMemo(
    () => tradeCategoryObject?.attributes?.textTemplate?.placeholders || [],
    [tradeCategoryObject]
  )
  const wastePlaceholderKeys = useMemo(
    () => (!isExcelCountry ? wasteCategoryObject?.attributes?.textTemplate?.placeholders || [] : []),
    [isExcelCountry, wasteCategoryObject]
  )
  const envPlaceholderKeys = useMemo(
    () => (!isExcelCountry ? envCategoryObject?.attributes?.textTemplate?.placeholders || [] : []),
    [isExcelCountry, envCategoryObject]
  )

  // --- useReplacedText hooks (gated on layerLoading to prevent double-fetch) ---
  const {
    placeholders: tradePlaceholders,
    tooltips: tradeTooltips,
    loading: tradeLoading,
  } = useReplacedText(
    query.country,
    query.countryCode,
    !layerLoading ? CATEGORY_IDS.INDUSTRY_AND_TRADE : null,
    tradePlaceholderKeys,
    tradeLayerJson
  )

  const {
    placeholders: wastePlaceholders,
    tooltips: wasteTooltips,
    loading: wasteLoading,
  } = useReplacedText(
    query.country,
    query.countryCode,
    !layerLoading && !isExcelCountry ? CATEGORY_IDS.WASTE_MANAGEMENT : null,
    wastePlaceholderKeys,
    wasteLayerJson
  )

  const {
    placeholders: envPlaceholders,
    tooltips: envTooltips,
    loading: envLoading,
  } = useReplacedText(
    query.country,
    query.countryCode,
    !layerLoading && !isExcelCountry ? CATEGORY_IDS.ENVIRONMENTAL_IMPACT : null,
    envPlaceholderKeys,
    envLayerJson
  )

  // --- Loading state ---
  const isLoading = isExcelCountry
    ? countryDataLoading
    : layerLoading || tradeLoading || wasteLoading || envLoading

  if (isLoading) {
    return (
      <div className={styles.spinner}>
        <Spin tip="Loading data..." size="large" />
      </div>
    )
  }

  // --- Build Strapi trade content (for all countries) ---
  let strapiTradeContent = null
  if (
    tradeCategoryObject &&
    !tradeLoading &&
    Object.keys(tradePlaceholders).length > 0
  ) {
    const processedPlaceholders = { ...tradePlaceholders }
    const importTrend =
      processedPlaceholders['importIncreasePercentage'] > 0
        ? 'increased'
        : 'decreased'
    const exportTrend =
      processedPlaceholders['exportIncreasePercentage'] > 0
        ? 'increased'
        : 'decreased'
    processedPlaceholders['importTrend'] = importTrend
    processedPlaceholders['exportTrend'] = exportTrend
    processedPlaceholders['importIncreasePercentage'] = Math.abs(
      processedPlaceholders['importIncreasePercentage']
    ).toFixed(1)
    processedPlaceholders['exportIncreasePercentage'] = Math.abs(
      processedPlaceholders['exportIncreasePercentage']
    ).toFixed(1)

    const rawTemplate =
      tradeCategoryObject.attributes?.textTemplate?.template || ''
    const wrappedTemplate = wrapPlaceholders(rawTemplate)
    const compiledTemplate = Handlebars.compile(wrappedTemplate, {
      noEscape: true,
    })
    let categoryText = compiledTemplate({
      ...processedPlaceholders,
      country: countryName,
    })
      // Remove <br> tags immediately after heading strong/b tags
      .replace(
        /(<(?:strong|b)[^>]*>(?:Plastic imports|Plastic exports|Plastic trade trends)<\/(?:strong|b)>)\s*(?:<br\s*\/?>)+/gi,
        '$1'
      )

    // Split into imports, exports, trends
    const trendsRegex =
      /<(?:strong|h3|h4)[^>]*>Plastic trade trends<\/(?:strong|h3|h4)>/i
    const trendsMatch = categoryText.match(trendsRegex)
    let importsExportsText = categoryText
    let trendsText = ''
    if (trendsMatch) {
      importsExportsText = categoryText.slice(0, trendsMatch.index).trim()
      trendsText = categoryText.slice(trendsMatch.index).trim()
    }

    const [firstHalf, secondHalf] = splitTextInHalf(
      importsExportsText,
      COLUMN_SPLIT_MARKER
    )

    // Append extra trade text from JSON summary (after the Strapi trends paragraph)
    const jsonSummary = textContent?.trade?.summary || ''
    if (jsonSummary && trendsText) {
      // Strip the heading + first paragraph (already from Strapi), keep the rest
      let extraText = jsonSummary
        .replace(/<h4[^>]*>.*?<\/h4>/i, '')  // remove heading
        .replace(/<p>.*?<\/p>/i, '')           // remove first paragraph (Strapi duplicate)
        .trim()
      if (extraText) {
        // Compile Handlebars placeholders like {{country}}
        const compiledExtra = Handlebars.compile(extraText, { noEscape: true })
        extraText = compiledExtra({ country: countryName })
        trendsText += '<div style="padding-top: 16px;">' + extraText + '</div>'
      }
    }

    const parseOpts = { convertHeadings: true }
    strapiTradeContent = {
      firstHalf: addTooltipsToPlaceholders(
        firstHalf,
        processedPlaceholders,
        tradeTooltips,
        parseOpts
      ),
      secondHalf: addTooltipsToPlaceholders(
        secondHalf,
        processedPlaceholders,
        tradeTooltips,
        parseOpts
      ),
      trends: trendsText
        ? addTooltipsToPlaceholders(
            trendsText,
            processedPlaceholders,
            tradeTooltips,
            parseOpts
          )
        : null,
    }
  }

  // --- Build Strapi waste content (non-Excel only) ---
  const strapiWasteContent = !isExcelCountry
    ? buildStrapiSectionContent(
        wasteCategoryObject,
        wastePlaceholders,
        wasteTooltips,
        countryName,
        (text) => splitTextByMarker(text, COLUMN_SPLIT_MARKER)
      )
    : null

  // --- Build Strapi environment content (non-Excel only) ---
  const strapiEnvironmentContent = !isExcelCountry
    ? buildStrapiSectionContent(
        envCategoryObject,
        envPlaceholders,
        envTooltips,
        countryName,
        (text) => splitTextByMarker(text, COLUMN_SPLIT_MARKER)
      )
    : null

  // --- Submit button ---
  const submitButton = !isMobile ? (
    <Tooltip title="Update country data by sending a request to the GPML Data Hub team.">
      <Button className={styles.buttonStyle} onClick={showModal}>
        {t`Submit Data Update`}
      </Button>
      <RequestDataUpdateModal
        visible={isModalVisible}
        onClose={handleClose}
      />
    </Tooltip>
  ) : null

  const firstSectionKey = availableSections?.[0]?.key

  return (
    <div className={styles.text}>
      {(availableSections || []).map((section) => {
        const Component = SECTION_COMPONENTS[section.key]
        if (!Component) return null
        const isFirst = section.key === firstSectionKey
        return (
          <Component
            key={section.key}
            ref={(el) => registerRef && registerRef(section.key, el)}
            textContent={textContent}
            countryData={countryData}
            countryName={countryName}
            countryCode={query.countryCode}
            layers={layers}
            layerLoading={layerLoading}
            {...(isFirst ? { headerExtra: submitButton } : {})}
            {...(section.key === 'trade'
              ? { strapiTradeContent }
              : {})}
            {...(section.key === 'waste-management'
              ? { strapiWasteContent }
              : {})}
            {...(section.key === 'environment'
              ? { strapiEnvironmentContent }
              : {})}
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

export default CountryOverview
