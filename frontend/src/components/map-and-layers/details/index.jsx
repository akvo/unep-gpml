import { useState, useEffect } from 'react'
import { Card, Button } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import Draggable from 'react-draggable'
import Legends from '../legends'

const Details = ({ title, layerId }) => {
  const [position, setPosition] = useState({ x: 1, y: 1 })
  const [showLegend, setShowLegend] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  console.log('build')

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  console.log('trigger build')

  const handleOnDrag = (e, { x, y }) => {
    setPosition({ x, y })
  }

  const toggleShowLegend = () => {
    setShowLegend(!showLegend)
  }

  return isMobile ? (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        background: 'white',
        borderTop: '1px solid #ccc',
        padding: '10px',
        boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Button
        className="show-hide-btn"
        type="text"
        onClick={toggleShowLegend}
        icon={showLegend ? <UpOutlined /> : <DownOutlined />}
        style={{ width: '100%', textAlign: 'center' }}
      >
        {showLegend ? 'Hide legend' : 'Show legend'}
      </Button>
      {showLegend && <Legends layerId={layerId} />}
    </div>
  ) : (
    <Draggable
      onDrag={handleOnDrag}
      position={position}
      bounds="parent"
      cancel=".cancel-drag"
    >
      <div
        style={{
          position: 'absolute',
          top: position.y,
          right: position.x,
          zIndex: 1000,
        }}
      >
        <Card
          size="small"
          title={title}
          style={{ width: 300, cursor: 'move' }}
          headStyle={{ cursor: 'move' }}
          bodyStyle={{ pointerEvents: 'auto' }}
          className="legend-card"
        >
          <Button
            className="show-hide-btn cancel-drag"
            type="text"
            onClick={toggleShowLegend}
            icon={showLegend ? <UpOutlined /> : <DownOutlined />}
          >
            {showLegend ? 'Hide legend' : 'Show legend'}
          </Button>
          {showLegend && <Legends layerId={layerId} />}
        </Card>
      </div>
    </Draggable>
  )
}

export default Details
