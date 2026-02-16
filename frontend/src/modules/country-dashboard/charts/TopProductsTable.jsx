import React from 'react'
import { Table, Typography } from 'antd'
import { t, Trans } from '@lingui/macro'
import { COLORS } from '../constants'

const { Title } = Typography

const TopProductsTable = ({ countryData, type, countryName }) => {
  if (!countryData) return null

  const rawRows = countryData['WTO_tables'] || []

  const exportSeparatorIdx = rawRows.findIndex(
    (r) => r.IMPORTS && String(r.IMPORTS).trim().toUpperCase() === 'EXPORTS'
  )

  let sectionRows
  if (exportSeparatorIdx === -1) {
    sectionRows = rawRows
  } else if (type === 'import') {
    sectionRows = rawRows.slice(0, exportSeparatorIdx)
  } else {
    sectionRows = rawRows.slice(exportSeparatorIdx + 1)
  }

  // Build rows: category group headers + data rows
  // Skip header rows where IMPORTS === "HS Code"
  const dataSource = []
  sectionRows.forEach((r, i) => {
    if (r.IMPORTS == null) return
    const val = String(r.IMPORTS).trim()
    if (val === 'HS Code') return
    if (isNaN(r.IMPORTS)) {
      // Category group header row
      dataSource.push({ key: `group-${i}`, _isGroup: true, _groupLabel: val })
    } else {
      dataSource.push({ ...r, key: i })
    }
  })

  const columns = [
    {
      title: t`HS Code`,
      dataIndex: 'IMPORTS',
      key: 'hs',
      width: 100,
      render: (val, row) => {
        if (row._isGroup) return { children: null, props: { colSpan: 0 } }
        return <strong>{val}</strong>
      },
    },
    {
      title: t`Description`,
      dataIndex: '__EMPTY',
      key: 'desc',
      render: (val, row) => {
        if (row._isGroup) {
          return {
            children: (
              <strong style={{ fontSize: '13px' }}>{row._groupLabel}</strong>
            ),
            props: { colSpan: 3 },
          }
        }
        return val
      },
    },
    {
      title: t`Value (Million USD)`,
      dataIndex: '__EMPTY_1',
      key: 'value',
      width: 150,
      render: (val, row) => {
        if (row._isGroup) return { children: null, props: { colSpan: 0 } }
        return val
          ? parseFloat(val).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })
          : '-'
      },
    },
  ]

  const name = countryName || 'the country'
  const titleText =
    type === 'import'
      ? `Top plastic product categories imported into ${name} in 2022`
      : `Top plastic product categories exported from ${name} in 2022`

  return (
    <div>
      <Title
        level={4}
        style={{
          color: '#6236FF',
          marginBottom: 20,
          fontSize: '22px',
          fontWeight: 600,
        }}
      >
        {titleText}
      </Title>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        scroll={{ x: true }}
        style={{ fontSize: '13px' }}
      />
      <div
        style={{
          textAlign: 'left',
          padding: '10px 0',
          color: COLORS.PRIMARY_DARK_BLUE,
          fontSize: '12px',
        }}
      >
        <Trans>Data source: </Trans>{' '}
        <a
          href="https://www.wto.org/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: COLORS.PRIMARY_DARK_BLUE, fontWeight: 'bold' }}
        >
          WTO 2023
        </a>
      </div>
    </div>
  )
}

export default TopProductsTable
