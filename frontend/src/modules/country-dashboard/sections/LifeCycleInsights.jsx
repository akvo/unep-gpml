import React from 'react'
import Handlebars from 'handlebars'
import styles from './LifeCycleInsights.module.scss'

const compile = (text, placeholders) => {
  const compiled = Handlebars.compile(text, { noEscape: true })
  return compiled(placeholders)
}

const LifeCycleInsights = ({ data, countryName }) => {
  if (!data || !data.sections) return null

  const placeholders = { country: countryName || '' }

  return (
    <div className={styles.twoColumnLayout}>
      {data.sections.map((section, index) => (
        <div className={styles.columnItem} key={index}>
          <h3 className={styles.sectionHeading}>
            {section.heading}
          </h3>

          {section.text.split('\n\n').map((para, i) => (
            <p key={i} className={styles.paragraph}>
              {compile(para, placeholders)}
            </p>
          ))}

          {section.policyOpportunities &&
            section.policyOpportunities.length > 0 && (
              <div className={styles.policyContainer}>
                <p className={styles.policyLabel}>
                  Policy opportunities:
                </p>
                <ul className={styles.policyList}>
                  {section.policyOpportunities.map((item, i) => (
                    <li key={i} className={styles.policyListItem}>
                      {compile(item, placeholders)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      ))}
    </div>
  )
}

export default LifeCycleInsights
