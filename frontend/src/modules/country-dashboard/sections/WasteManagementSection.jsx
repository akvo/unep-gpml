import React from 'react'
import { Row, Col } from 'antd'
import { t } from '@lingui/macro'
import SectionText from './SectionText'
import KeyTrends from './KeyTrends'
import styles from '../CountryOverview.module.scss'

const WasteManagementSection = React.forwardRef(
  ({ textContent, countryData, countryName }, ref) => {
    if (!textContent?.wasteManagement) return null

    const wm = textContent.wasteManagement

    return (
      <div
        ref={ref}
        data-section="waste-management"
        className={styles.dashboardSection}
      >
        <h2 className={styles.sectionTitle}>Waste Management</h2>

        <KeyTrends items={wm.keyTrends} title={t`Key trends`} />

        {wm.municipalLeft && (
          <>
            <h3 className={styles.sectionHeading}>
              {t`Plastic waste from municipal solid waste`}
            </h3>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <SectionText template={wm.municipalLeft} />
              </Col>
              {wm.municipalRight && (
                <Col xs={24} md={12}>
                  <SectionText template={wm.municipalRight} />
                </Col>
              )}
            </Row>
          </>
        )}

        {wm.nonMunicipal && (
          <>
            <h3 className={styles.sectionHeading}>
              {t`Plastic waste from non-municipal solid waste`}
            </h3>
            <SectionText template={wm.nonMunicipal} />
          </>
        )}

        {/* Fallback for legacy content/contentRight keys */}
        {!wm.municipalLeft && wm.content && (
          <SectionText template={wm.content} />
        )}
        {!wm.municipalLeft && wm.contentRight && (
          <SectionText template={wm.contentRight} />
        )}
      </div>
    )
  }
)

WasteManagementSection.displayName = 'WasteManagementSection'
export default WasteManagementSection
