import React from 'react'
import styles from './KeyTrends.module.scss'

const KeyTrends = ({ items, title }) => {
  if (!items || items.length === 0) return null

  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <ul className={styles.list}>
        {items.map((item, i) => (
          <li key={i} className={styles.listItem}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default KeyTrends
