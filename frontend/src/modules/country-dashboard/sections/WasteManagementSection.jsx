import React from 'react'
import { Row, Col } from 'antd'
import dynamic from 'next/dynamic'
import { t } from '@lingui/macro'
import SectionText from './SectionText'
import KeyTrends from './KeyTrends'
import ChartCard from '../ChartCard'
import styles from '../CountryOverview.module.scss'

const MSWGenerationChart = dynamic(
  () => import('../charts/MSWGeneration'),
  { ssr: false }
)
const PlasticCompositionChart = dynamic(
  () => import('../charts/PlasticCompositionChart'),
  { ssr: false }
)

const WasteManagementSection = React.forwardRef(
  ({ textContent, countryData, countryName, layers, layerLoading }, ref) => {
    if (!textContent?.wasteManagement) return null

    return (
      <div
        ref={ref}
        data-section="waste-management"
        className={styles.dashboardSection}
      >
        <h2 className={styles.sectionTitle}>Waste Management</h2>

        <KeyTrends
          items={textContent.wasteManagement.keyTrends}
          title={t`Key trends`}
        />

        <Row gutter={[16, 16]} className={styles.chartRow}>
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

        {textContent.wasteManagement.content && (
          <div className={styles.twoColumnText}>
            <SectionText template={textContent.wasteManagement.content} />
            {textContent.wasteManagement.contentRight && (
              <SectionText template={textContent.wasteManagement.contentRight} />
            )}
          </div>
        )}
      </div>
    )
  }
)

WasteManagementSection.displayName = 'WasteManagementSection'
export default WasteManagementSection
