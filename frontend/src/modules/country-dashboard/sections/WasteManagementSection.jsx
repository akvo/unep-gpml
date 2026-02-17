import React from 'react'
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
