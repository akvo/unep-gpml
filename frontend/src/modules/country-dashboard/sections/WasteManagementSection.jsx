import React from 'react'
import { Row, Col } from 'antd'
import dynamic from 'next/dynamic'
import SectionText from './SectionText'
import KeyTrends from './KeyTrends'
import ChartCard from '../ChartCard'
import WFDStudies from './WFDStudies'
import styles from '../CountryOverview.module.scss'

const MSWGenerationChart = dynamic(() => import('../charts/MSWGeneration'), {
  ssr: false,
})
const PlasticCompositionChart = dynamic(
  () => import('../charts/PlasticCompositionChart'),
  { ssr: false }
)

const WasteManagementSection = React.forwardRef(
  (
    {
      textContent,
      countryData,
      countryName,
      countryCode,
      layers,
      layerLoading,
      strapiWasteContent,
    },
    ref
  ) => {
    if (!textContent?.wasteManagement && !strapiWasteContent) return null

    return (
      <div
        ref={ref}
        data-section="waste-management"
        className={styles.dashboardSection}
      >
        <h2 className={styles.sectionTitle}>Waste Management</h2>

        {textContent?.wasteManagement?.keyTrends && (
          <KeyTrends
            items={textContent.wasteManagement.keyTrends}
            title="Key trends"
            placeholders={{ country: countryName }}
          />
        )}

        {strapiWasteContent && !textContent?.wasteManagement ? (
          <>
            <Row gutter={[16, 16]} className={styles.chartRow}>
              <Col xs={24} md={12}>
                <div className={styles.textColumn}>
                  {strapiWasteContent.firstHalf}
                </div>
              </Col>
              {strapiWasteContent.secondHalf && (
                <Col xs={24} md={12}>
                  <div className={styles.textColumn}>
                    {strapiWasteContent.secondHalf}
                  </div>
                </Col>
              )}
            </Row>

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
          </>
        ) : (
          <>
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

            {textContent?.wasteManagement?.content && (
              <div className={styles.twoColumnText}>
                <SectionText
                  template={textContent.wasteManagement.content}
                  placeholders={{ country: countryName }}
                />
                {textContent.wasteManagement.contentRight && (
                  <SectionText
                    template={textContent.wasteManagement.contentRight}
                    placeholders={{ country: countryName }}
                  />
                )}
              </div>
            )}
          </>
        )}
        <WFDStudies countryCode={countryCode} />
      </div>
    )
  }
)

WasteManagementSection.displayName = 'WasteManagementSection'
export default WasteManagementSection
