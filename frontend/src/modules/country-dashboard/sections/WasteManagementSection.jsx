import React from 'react'
import { Row, Col } from 'antd'
import { t } from '@lingui/macro'
import SectionText from './SectionText'
import KeyTrends from './KeyTrends'
import styles from '../CountryOverview.module.scss'

const WasteManagementSection = React.forwardRef(
  ({ textContent, countryData, countryName }, ref) => {
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

        {textContent.wasteManagement.content && (
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <SectionText template={textContent.wasteManagement.content} />
            </Col>
            {textContent.wasteManagement.contentRight && (
              <Col xs={24} md={12}>
                <SectionText template={textContent.wasteManagement.contentRight} />
              </Col>
            )}
          </Row>
        )}
      </div>
    )
  }
)

WasteManagementSection.displayName = 'WasteManagementSection'
export default WasteManagementSection
