import React from 'react'
import { Row, Col } from 'antd'
import dynamic from 'next/dynamic'
import { t } from '@lingui/macro'
import SectionText from './SectionText'
import KeyTrends from './KeyTrends'
import ChartCard from '../ChartCard'
import styles from '../CountryOverview.module.scss'

const TradingPartnersBarChart = dynamic(
  () => import('../charts/TradingPartnersBarChart'),
  { ssr: false }
)
const TradeCompositionPieChart = dynamic(
  () => import('../charts/TradeCompositionPieChart'),
  { ssr: false }
)
const TopProductsTable = dynamic(
  () => import('../charts/TopProductsTable'),
  { ssr: false }
)

const TradeSection = React.forwardRef(
  ({ textContent, countryData, countryName }, ref) => {
    if (!textContent?.trade) return null

    return (
      <div ref={ref} data-section="trade" className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Trade</h2>

        <KeyTrends items={textContent.trade.keyTrends} title={t`Key trends`} />

        {textContent.trade.summary && (
          <SectionText template={textContent.trade.summary} />
        )}

        {countryData && (
          <>
            {textContent.trade.tradingPartners && (
              <>
                <h3 className={styles.sectionHeading}>{t`Top Trading Partners`}</h3>
                <SectionText template={textContent.trade.tradingPartners} />
              </>
            )}

            <Row className={styles.chartRow}>
              <Col span={24}>
                <ChartCard>
                  <TradingPartnersBarChart countryData={countryData} />
                </ChartCard>
              </Col>
            </Row>

            {textContent.trade.productCategories && (
              <>
                <h3 className={styles.sectionHeading}>{t`Top Product Categories`}</h3>
                <SectionText template={textContent.trade.productCategories} />
              </>
            )}

            <Row gutter={[16, 16]} className={styles.chartRow}>
              <Col xs={24} md={12}>
                <ChartCard>
                  <TradeCompositionPieChart countryData={countryData} type="import" />
                </ChartCard>
              </Col>
              <Col xs={24} md={12}>
                <ChartCard>
                  <TradeCompositionPieChart countryData={countryData} type="export" />
                </ChartCard>
              </Col>
            </Row>

            <div className={styles.chartRow}>
              <TopProductsTable
                countryData={countryData}
                type="import"
                countryName={countryName}
              />
            </div>

            <div className={styles.chartRow}>
              <TopProductsTable
                countryData={countryData}
                type="export"
                countryName={countryName}
              />
            </div>
          </>
        )}
      </div>
    )
  }
)

TradeSection.displayName = 'TradeSection'
export default TradeSection
