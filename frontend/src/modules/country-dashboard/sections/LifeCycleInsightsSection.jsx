import React from 'react'
import LifeCycleInsights from './LifeCycleInsights'
import styles from '../CountryOverview.module.scss'

const LifeCycleInsightsSection = React.forwardRef(
  ({ textContent, countryData, countryName }, ref) => {
    if (!textContent?.lifeCycleInsights) return null

    return (
      <div
        ref={ref}
        data-section="life-cycle-insights"
        className={styles.dashboardSection}
      >
        <h2 className={styles.sectionTitle}>Life Cycle Insights</h2>
        <LifeCycleInsights data={textContent.lifeCycleInsights} countryName={countryName} />
      </div>
    )
  }
)

LifeCycleInsightsSection.displayName = 'LifeCycleInsightsSection'
export default LifeCycleInsightsSection
