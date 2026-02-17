import React from 'react'
import SectionText from './SectionText'
import styles from '../CountryOverview.module.scss'

const ProductionSection = React.forwardRef(
  ({ textContent, countryData, countryName, headerExtra }, ref) => {
    if (!textContent?.production) return null

    return (
      <div ref={ref} data-section="production" className={styles.dashboardSection}>
        <div className={styles.sectionTitleRow}>
          <h2 className={styles.sectionTitle}>Production</h2>
          {headerExtra}
        </div>
        {textContent.production.content && (
          <SectionText template={textContent.production.content} />
        )}
      </div>
    )
  }
)

ProductionSection.displayName = 'ProductionSection'
export default ProductionSection
