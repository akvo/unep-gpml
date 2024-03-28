import { useState } from 'react'
import { Card, Button } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import Draggable from 'react-draggable'
import Legends from '../legends'

const Details = ({ title, layerId }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [showLegend, setShowLegend] = useState(true)

  const handleOnDrag = (e, { x, y }) => {
    setPosition({ x, y })
  }

  const toggleShowLegend = () => {
    setShowLegend(!showLegend)
  }

  return (
    <Draggable
      onDrag={handleOnDrag}
      position={position}
      disabled={false}
      bounds="parent"
    >
      <div
        style={{
          position: 'absolute',
          top: position.y,
          left: position.x,
          zIndex: 1000,
        }}
      >
        <Card
          size="small"
          title={title}
          extra={
            <Button
              type="text"
              onClick={toggleShowLegend}
              icon={showLegend ? <UpOutlined /> : <DownOutlined />}
            >
              {' '}
              {showLegend ? 'Hide legend' : 'Show legend'}
            </Button>
          }
          style={{
            width: 350,
            cursor: 'move',
          }}
          headStyle={{
            cursor: 'move',
          }}
          bodyStyle={{
            display: showLegend ? 'block' : 'none',
            pointerEvents: 'auto',
          }}
        >
          {showLegend && <Legends layerId={layerId} />}
        </Card>
      </div>
    </Draggable>
  )
}

export default Details
