import React from 'react'
import { Button, Card, Typography } from 'antd'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const { Title: AntTitle, Paragraph: AntParagraph } = Typography

const LayerInfo = ({ layer }) => {
  const handleReadMoreClick = () => {
    window.open(layer?.attributes.metadataURL, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadData = () => {
    if (!layer?.attributes.ValuePerCountry?.length) {
      console.error('No data available to download.')
      return
    }

    const data = layer.attributes.ValuePerCountry.map((entry) => ({
      Year: entry.Year,
      Country: entry.CountryName,
      Value: entry.Value,
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Layer data")

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })

    saveAs(blob, `${layer?.attributes.title || 'LayerData'}.xlsx`)
  }

  return (
    <div style={{ border: 'none' }}>
      <Card>
        <AntTitle level={3}>{layer?.attributes.title}</AntTitle>
        <div dangerouslySetInnerHTML={{ __html: layer?.attributes.metadata }} />
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
        <Button
          type="primary"
          onClick={handleDownloadData}
          style={{ marginTop: '10px' }}
        >
          Download Data
        </Button>
      </Card>
    </div>
  )
}

export default LayerInfo
