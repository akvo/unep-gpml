import React from 'react'
import styles from './ChartCard.module.scss'

const ChartCard = ({ children, className }) => (
  <div className={`${styles.chartCard} ${className || ''}`}>{children}</div>
)

export default ChartCard
