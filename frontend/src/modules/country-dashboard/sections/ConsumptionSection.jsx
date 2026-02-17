import React from 'react'
import { Row, Col } from 'antd'
import dynamic from 'next/dynamic'
import SectionText from './SectionText'
import ChartCard from '../ChartCard'
import styles from '../CountryOverview.module.scss'

const PlasticConsumptionChart = dynamic(
  () => import('../charts/PlasticConsumptionChart'),
  { ssr: false }
)

const ConsumptionSection = React.forwardRef(
  ({ textContent, countryData, countryName }, ref) => {
    if (!textContent?.consumption) return null

    return (
      <div ref={ref} data-section="consumption" className={styles.dashboardSection}>
        <h2 className={styles.sectionTitle}>Consumption</h2>

        {textContent.consumption.content && (
          <div className={styles.twoColumnText}>
            <SectionText template={textContent.consumption.content} />
          </div>
        )}

        {countryData && (
          <Row className={styles.chartRow}>
            <Col span={24}>
              <ChartCard>
                <PlasticConsumptionChart countryData={countryData} />
              </ChartCard>
            </Col>
          </Row>
        )}
      </div>
    )
  }
)

ConsumptionSection.displayName = 'ConsumptionSection'
export default ConsumptionSection
