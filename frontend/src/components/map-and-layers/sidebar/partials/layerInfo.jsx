import React from 'react'
import { Button, Card, Typography } from 'antd'

const { Title: AntTitle, Paragraph: AntParagraph } = Typography

const LayerInfo = ({ layer }) => {
  const handleReadMoreClick = () => {
    window.open(layer?.attributes.metadataURL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{ border: 'none' }}>
      <Card>
        <AntTitle level={3}>{layer?.attributes.title}</AntTitle>
        <AntParagraph>{layer?.attributes.metadata}</AntParagraph>
        <Button
          type="link"
          onClick={handleReadMoreClick}
          style={{ border: '1px solid #09334B', padding: '0 8px' }}
        >
          Read More
        </Button>
      </Card>

      <Card>
        <AntParagraph>
          <strong>Time Period:</strong> {layer?.attributes.timePeriod}
        </AntParagraph>
        <AntParagraph>
          <strong>Data Source:</strong> {layer?.attributes.dataSource}
        </AntParagraph>
        <AntParagraph>
          <strong>URL:</strong>{' '}
          <a
            href={layer?.attributes.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {layer?.attributes.url}
          </a>
        </AntParagraph>
      </Card>
    </div>
  )
}

export default LayerInfo
