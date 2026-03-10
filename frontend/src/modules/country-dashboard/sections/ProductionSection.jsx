import React from 'react'
import dynamic from 'next/dynamic'
import SectionText from './SectionText'
import ChartCard from '../ChartCard'
import styles from '../CountryOverview.module.scss'

const ProductionPieChart = dynamic(
  () => import('../charts/ProductionPieChart'),
  { ssr: false }
)

const ProductionSection = React.forwardRef(
  ({ textContent, countryData, countryName, headerExtra }, ref) => {
    if (!textContent?.production) return null

    const { chartData, chartTitle, chartSource, chartSourceUrl } =
      textContent.production

    return (
      <div ref={ref} data-section="production" className={styles.dashboardSection}>
        <div className={styles.sectionTitleRow}>
          <h2 className={styles.sectionTitle}>Production</h2>
          {headerExtra}
        </div>
        {textContent.production.content && (
          <SectionText template={textContent.production.content} placeholders={{ country: countryName }} />
        )}
        {chartData && (
          <ChartCard>
            <ProductionPieChart
              chartData={chartData}
              chartTitle={chartTitle}
              chartSource={chartSource}
              chartSourceUrl={chartSourceUrl}
            />
          </ChartCard>
        )}
      </div>
    )
  }
)

ProductionSection.displayName = 'ProductionSection'
export default ProductionSection
