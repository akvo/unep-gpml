import React from 'react'

const Thumbnail = ({ url, width = 100, height = 150 }) => (
  <div
    style={{
      width,
      height,
      border: '1px solid #18162F',
      boxSizing: 'border-box',
      borderRadius: 7,
      backgroundImage: `url(${url})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%'
    }}
  />
)

export default Thumbnail
