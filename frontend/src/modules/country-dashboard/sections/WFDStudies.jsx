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

const buildSankeyOption = (d) => {
  const links = [
    {
      source: 'Generation',
      target: 'Collection services',
      value:
        Number(d.DNAdisposedplastics || 0) + Number(d.recoveredplastics || 0),
      lineStyle: { color: '#C5E0B4', opacity: 0.6 },
    },
    {
      source: 'Generation',
      target: 'Unmanaged',
      value:
        Number(d.DNAlandretention || 0) +
        Number(d.DNAdrainretention || 0) +
        Number(d.DNAtowater || 0) +
        Number(d.F22a || 0),
      lineStyle: { color: '#F4B8B0', opacity: 0.6 },
    },
    {
      source: 'Collection services',
      target: 'Disposal',
      value: d.DNAdisposedplastics || 0,
      lineStyle: { color: '#C5E0B4', opacity: 0.6 },
    },
    {
      source: 'Collection services',
      target: 'Sorted for recovery',
      value: d.recoveredplastics || 0,
      lineStyle: { color: '#C5E0B4', opacity: 0.6 },
    },
    {
      source: 'Unmanaged',
      target: 'Land',
      value: d.DNAlandretention || 0,
      lineStyle: { color: '#F4B8B0', opacity: 0.6 },
    },
    {
      source: 'Unmanaged',
      target: 'Drains',
      value: d.DNAdrainretention || 0,
      lineStyle: { color: '#F4B8B0', opacity: 0.6 },
    },
    {
      source: 'Unmanaged',
      target: 'Water',
      value: d.DNAtowater || 0,
      lineStyle: { color: '#F4B8B0', opacity: 0.6 },
    },
    {
      source: 'Unmanaged',
      target: 'Burnt',
      value: d.F22a || 0,
      lineStyle: { color: '#F4B8B0', opacity: 0.6 },
    },
  ]
  console.log(links)

  const outgoing = {}
  const incoming = {}
  links.forEach(({ source, target, value }) => {
    outgoing[source] = (outgoing[source] || 0) + value
    incoming[target] = (incoming[target] || 0) + value
  })
  const middleNodes = new Set(Object.keys(outgoing).filter((n) => incoming[n]))

  return {
    series: {
      type: 'sankey',
      orient: 'horizontal',
      nodeAlign: 'justify',
      data: SANKEY_NODES,
      links,
      label: {
        formatter: (params) => {
          if (middleNodes.has(params.name)) return params.name
          const val = outgoing[params.name] || incoming[params.name]
          if (!val) return params.name
          return params.name === 'Generation'
            ? `${params.name}: ${Number(val).toLocaleString()} t/year`
            : `${params.name}: ${Number(val).toLocaleString()}`
        },
      },
    },
  }
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
  const [flowData, setFlowData] = useState(null)
  const [flowLoading, setFlowLoading] = useState(false)

  useEffect(() => {
    const iso2 = toIso2(countryCode)
    if (!iso2) return
    setLoading(true)
    setStudies([])
    setSelected(undefined)
    setFlowData(null)
    fetch(
      `https://wfd-data.rwm.global/api/studies/key/${API_KEY}/country/${iso2}/encoding/json`
    )
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data)
          ? data
          : data?.studies || data?.data || []
        setStudies(items)
      })
      .catch(() => setStudies([]))
      .finally(() => setLoading(false))
  }, [countryCode])

  useEffect(() => {
    if (selected == null) {
      setFlowData(null)
      return
    }
    setFlowLoading(true)
    fetch(
      `https://wfd-data.rwm.global/api/studyFlow/key/${API_KEY}/study/${selected}/encoding/json`
    )
      .then((res) => res.json())
      .then((data) => {
        const d = Array.isArray(data) ? data[0] : data
        setFlowData(d || null)
      })
      .catch(() => setFlowData(null))
      .finally(() => setFlowLoading(false))
  }, [selected])

  if (!loading && studies.length === 0) return null

  return (
    <div className={styles.wfdStudies}>
      <h4 className={styles.wfdStudiesTitle}>
        Plastic leakage in municipal solid waste management systems in cities
      </h4>
      <p>
        A study on plastic leakage from municipal solid waste management systems
        in [year] in created a sanky diagram as shown below. This can provide
        insights on what stages of the waste management system is the largest
        source of plastic pollution
      </p>
      {loading ? (
        <Spin size="small" />
      ) : (
        <>
          <Select
            className="city-study-select"
            style={{ width: '100%', maxWidth: 480 }}
            placeholder="Select a study"
            value={selected}
            onChange={setSelected}
            options={studies.map((s) => ({
              value: s.ID,
              label: s.study_name,
            }))}
          />
          {flowLoading && <Spin size="small" style={{ marginTop: 24 }} />}
          {!flowLoading && flowData && (
            <ReactEcharts
              option={buildSankeyOption(flowData)}
              style={{ height: 500, marginTop: 24 }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default WFDStudies
