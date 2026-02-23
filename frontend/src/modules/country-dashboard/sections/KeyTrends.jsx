import React from 'react'
import Handlebars from 'handlebars'
import styles from './KeyTrends.module.scss'

const KeyTrends = ({ items, title, placeholders = {} }) => {
  if (!items || items.length === 0) return null

  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <ul className={styles.list}>
        {items.map((item, i) => {
          const compiled = Handlebars.compile(item, { noEscape: true })
          const text = compiled(placeholders)
          return (
            <li key={i} className={styles.listItem}>
              {text}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default KeyTrends
