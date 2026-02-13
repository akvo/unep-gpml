import React from 'react'

const chartCardStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  padding: '20px 15px',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
}

const ChartCard = ({ children, style }) => (
  <div style={{ ...chartCardStyle, ...style }}>{children}</div>
)

export default ChartCard
