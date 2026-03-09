import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Select, Spin } from 'antd'
import styles from '../CountryOverview.module.scss'

const ReactEcharts = dynamic(() => import('echarts-for-react'), { ssr: false })

const SANKEY_NODES = [
  { name: 'Generation', itemStyle: { color: '#4472C4' } },
  { name: 'Collection services', itemStyle: { color: '#9DC3E6' } },
  { name: 'Unmanaged', itemStyle: { color: '#FFB940' } },
  { name: 'Disposal', itemStyle: { color: '#375623' } },
  { name: 'Sorted for recovery', itemStyle: { color: '#A9D18E' } },
  { name: 'Land', itemStyle: { color: '#548235' } },
  { name: 'Drains', itemStyle: { color: '#444444' } },
  { name: 'Water', itemStyle: { color: '#2E75B6' } },
  { name: 'Burnt', itemStyle: { color: '#ED7D31' } },
]

const SANKEY_LINKS = [
  { source: 'Generation', target: 'Collection services', value: 61880, lineStyle: { color: '#C5E0B4', opacity: 0.6 } },
  { source: 'Generation', target: 'Unmanaged', value: 62737, lineStyle: { color: '#F4B8B0', opacity: 0.6 } },
  { source: 'Collection services', target: 'Disposal', value: 37659, lineStyle: { color: '#C5E0B4', opacity: 0.6 } },
  { source: 'Collection services', target: 'Sorted for recovery', value: 24221, lineStyle: { color: '#C5E0B4', opacity: 0.6 } },
  { source: 'Unmanaged', target: 'Land', value: 25045, lineStyle: { color: '#F4B8B0', opacity: 0.6 } },
  { source: 'Unmanaged', target: 'Drains', value: 534, lineStyle: { color: '#F4B8B0', opacity: 0.6 } },
  { source: 'Unmanaged', target: 'Water', value: 25293, lineStyle: { color: '#F4B8B0', opacity: 0.6 } },
  { source: 'Unmanaged', target: 'Burnt', value: 11865, lineStyle: { color: '#F4B8B0', opacity: 0.6 } },
]

// Precompute node values from links so the formatter doesn't rely on params.value
const sankeyOutgoing = {}
const sankeyIncoming = {}
SANKEY_LINKS.forEach(({ source, target, value }) => {
  sankeyOutgoing[source] = (sankeyOutgoing[source] || 0) + value
  sankeyIncoming[target] = (sankeyIncoming[target] || 0) + value
})
// Middle nodes: appear as both source and target — hide their value label
const sankeyMiddleNodes = new Set(
  Object.keys(sankeyOutgoing).filter((n) => sankeyIncoming[n])
)

const SANKEY_OPTION = {
  series: {
    type: 'sankey',
    orient: 'horizontal',
    nodeAlign: 'justify',
    data: SANKEY_NODES,
    links: SANKEY_LINKS,
    label: {
      formatter: (params) => {
        if (sankeyMiddleNodes.has(params.name)) return params.name
        const val = sankeyOutgoing[params.name] || sankeyIncoming[params.name]
        if (!val) return params.name
        return params.name === 'Generation'
          ? `${params.name}: ${Number(val).toLocaleString()} t/year`
          : `${params.name}: ${Number(val).toLocaleString()}`
      },
    },
  },
}

const API_KEY =
  '292b35d6e5b6ab61aa54354f1f6043c3fecc5ecb950fdffa63af394ef8719282'

// ISO 3166-1 alpha-3 → alpha-2 mapping for countries used in this dashboard
const ISO3_TO_ISO2 = {
  KHM: 'KH',
  ZAF: 'ZA',
  SEN: 'SN',
  JPN: 'JP',
  ECU: 'EC',
  PER: 'PE',
  IND: 'IN',
  MUS: 'MU',
  LBN: 'LB',
  SLB: 'SB',
  KEN: 'KE',
}

const toIso2 = (code) => {
  if (!code) return null
  if (code.length === 2) return code.toUpperCase()
  return ISO3_TO_ISO2[code.toUpperCase()] ?? null
}

const WFDStudies = ({ countryCode }) => {
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(undefined)

  useEffect(() => {
    const iso2 = toIso2(countryCode)
    if (!iso2) return
    setLoading(true)
    setStudies([])
    setSelected(undefined)
    fetch(
      `https://wfd-data.rwm.global/api/studies/key/${API_KEY}/country/${iso2}/encoding/json`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        const items = Array.isArray(data)
          ? data
          : data?.studies || data?.data || []
        setStudies(items)
      })
      .catch(() => setStudies([]))
      .finally(() => setLoading(false))
  }, [countryCode])

  if (!loading && studies.length === 0) return null

  return (
    <div className={styles.wfdStudies}>
      <h3 className={styles.wfdStudiesTitle}>Waste Flow Diagram Studies</h3>
      {loading ? (
        <Spin size="small" />
      ) : (
        <>
          <Select
            style={{ width: '100%', maxWidth: 480 }}
            placeholder="Select a study"
            value={selected}
            onChange={setSelected}
            options={studies.map((s, i) => ({
              value: s.study_name ?? i,
              label: s.study_name,
            }))}
          />
          <ReactEcharts
            option={SANKEY_OPTION}
            style={{ height: 500, marginTop: 24 }}
          />
        </>
      )}
    </div>
  )
}

export default WFDStudies
