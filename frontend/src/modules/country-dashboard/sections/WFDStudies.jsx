import React, { useEffect, useState } from 'react'
import { Select, Spin } from 'antd'
import styles from '../CountryOverview.module.scss'

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
      )}
    </div>
  )
}

export default WFDStudies
