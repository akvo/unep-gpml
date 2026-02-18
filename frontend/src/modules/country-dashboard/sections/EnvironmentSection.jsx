import React from 'react'
import { t } from '@lingui/macro'
import SectionText from './SectionText'
import KeyTrends from './KeyTrends'
import styles from '../CountryOverview.module.scss'

const EnvironmentSection = React.forwardRef(
  ({ textContent, countryData, countryName }, ref) => {
    if (!textContent?.environment) return null

    return (
      <div
        ref={ref}
        data-section="environment"
        className={styles.dashboardSection}
      >
        <h2 className={styles.sectionTitle}>Plastics in the Environment</h2>

        <KeyTrends
          items={textContent.environment.keyTrends}
          title={t`Key trends`}
        />

        {textContent.environment.content && (
          <div className={styles.twoColumnText}>
            <SectionText template={textContent.environment.content} />
          </div>
        )}
      </div>
    )
  }
)

EnvironmentSection.displayName = 'EnvironmentSection'
export default EnvironmentSection
