import React from 'react'
import { Row, Col } from 'antd'
import { Trans } from '@lingui/macro'
import styles from './LifeCycleInsights.module.scss'

const LifeCycleInsights = ({ data }) => {
  if (!data || !data.sections) return null

  return (
    <div>
      <Row gutter={[48, 32]}>
        {data.sections.map((section, index) => (
          <Col xs={24} md={12} key={index}>
            <h3 className={styles.sectionHeading}>
              {section.heading}
            </h3>

            {section.text.split('\n\n').map((para, i) => (
              <p key={i} className={styles.paragraph}>
                {para}
              </p>
            ))}

            {section.policyOpportunities &&
              section.policyOpportunities.length > 0 && (
                <div className={styles.policyContainer}>
                  <p className={styles.policyLabel}>
                    <Trans>Policy opportunities:</Trans>
                  </p>
                  <ul className={styles.policyList}>
                    {section.policyOpportunities.map((item, i) => (
                      <li key={i} className={styles.policyListItem}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default LifeCycleInsights
