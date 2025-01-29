import React from 'react'
import { Button, Card, Typography } from 'antd'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'

const { Title: AntTitle, Paragraph: AntParagraph } = Typography

const LayerInfo = ({ layer }) => {
  const handleReadMoreClick = () => {
    window.open(layer?.attributes.metadataURL, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadData = () => {
    if (!layer?.attributes.ValuePerCountry?.length) {
      console.error(t`No data available to download.`)
      return
    }

    const data = layer.attributes.ValuePerCountry.map((entry) => ({
      Year: entry.Year,
      Country: entry.CountryName,
      Value: entry.Value,
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, t`Layer data`)

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })

    saveAs(blob, `${layer?.attributes.title || t`LayerData`}.xlsx`) 
  }

  const hasDataToDownload =
    Array.isArray(layer?.attributes?.ValuePerCountry) &&
    layer.attributes.ValuePerCountry.length > 0

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
          {t`Read More`}
        </Button>
      </Card>

      <Card>
        <AntParagraph>
          <strong>{t`Time Period`}:</strong> {layer?.attributes.timePeriod}
        </AntParagraph>
        <AntParagraph>
          <strong>{t`Data Source`}:</strong> {layer?.attributes.dataSource}
        </AntParagraph>
        <AntParagraph>
          <strong>{t`URL`}:</strong>{' '}
          <a
            href={layer?.attributes.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {layer?.attributes.url}
          </a>
        </AntParagraph>

        {hasDataToDownload && (
          <Button
            type="primary"
            onClick={handleDownloadData}
            style={{ marginTop: '10px' }}
          >
            {t`Download Data`}
          </Button>
        )}
      </Card>
    </div>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default LayerInfo
