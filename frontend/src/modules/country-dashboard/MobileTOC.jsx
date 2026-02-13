import React from 'react'
import styles from './CountryOverview.module.scss'

const MobileTOC = ({ availableSections, activeSection, scrollToSection }) => {
  if (!availableSections || availableSections.length === 0) return null

  return (
    <div className={styles.mobileToc}>
      {availableSections.map((section) => (
        <button
          key={section.key}
          className={
            activeSection === section.key
              ? styles.tocPillActive
              : styles.tocPill
          }
          onClick={() => scrollToSection(section.key)}
        >
          {section.title}
        </button>
      ))}
    </div>
  )
}

export default MobileTOC
