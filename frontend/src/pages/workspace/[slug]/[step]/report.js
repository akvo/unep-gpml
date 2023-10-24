import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Spin } from 'antd'
import Link from 'next/link'
import classNames from 'classnames'

import styles from './report.module.scss'
import { useRouter } from 'next/router'
import {
  iso2id,
  isoA2,
  stepsState,
} from '../../../../modules/workspace/ps/config'
import api from '../../../../utils/api'

const ReportPage = () => {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPrinted, setIsPrinted] = useState(false)

  const router = useRouter()
  const { step, slug } = router.query

  const currentStep = useMemo(() => {
    return stepsState.find((s) => s?.slug === step)
  }, [step, stepsState])

  const getAllBookmarks = useCallback(async () => {
    if (!currentStep?.substeps) {
      return
    }
    try {
      const country = slug?.replace('plastic-strategy-', '')
      const countryCode = isoA2?.[country]
      const countryID = iso2id?.[countryCode]
      /**
       * Get all sub-steps that have browse endpoint
       */
      const allSections = currentStep.substeps
        .filter((s) => s?.apiParams)
        .map((s) => {
          const params = s.apiParams?.country
            ? { ...s.apiParams, country: countryID }
            : s.apiParams
          const basePath = s.apiParams?.basePath || 'browse'
          return {
            label: s.label,
            api: api.get(`/${basePath}`, {
              ...params,
              tag: params?.tag?.replace('{country}', country),
              ps_country_iso_code_a2: countryCode,
            }),
          }
        })
      const endpoints = allSections.map((a) => a.api)
      const responses = await Promise.allSettled(endpoints)
      /**
       * Get all bookmarked items and add URLs based on type.
       */
      const _bookmarks = responses.map(({ value: { data } }, index) => {
        const { results } = data || {}
        const label = allSections?.[index]?.label
        const items = results
          ?.filter((d) => d?.plasticStrategyBookmarks)
          ?.map((d) => {
            const pathname =
              label === 'Stakeholder Map'
                ? 'organisation'
                : d?.type?.replace('_', '-')
            return {
              ...d,
              url: `/${pathname}/${d.id}`,
            }
          })
        return {
          label,
          items,
        }
      })
      setBookmarks(_bookmarks)
      setLoading(false)
    } catch (error) {
      console.log('Unable to fetch all bookmarked URLS', error)
      setLoading(false)
    }
  }, [currentStep, slug, loading])

  useEffect(() => {
    getAllBookmarks()
  }, [getAllBookmarks])

  useEffect(() => {
    if (!loading && typeof window !== 'undefined' && !isPrinted) {
      setIsPrinted(true)
      window.print()
    }
  }, [loading, isPrinted])

  return (
    <div className={classNames('container', styles.reportView)}>
      <span className="title">
        {currentStep?.label ? `Summary of ${currentStep.label}` : ''}
      </span>
      <Spin spinning={loading} size="large" tip="Printing..." />
      {bookmarks
        .filter((bm) => bm.items.length)
        .map((bm, bx) => {
          return (
            <React.Fragment key={bx}>
              <h4 className="h-l">{bm.label}</h4>
              <div>
                <ul>
                  {bm.items.map((item, index) => {
                    return (
                      <li key={index}>
                        <h6>{item?.title || item?.name}</h6>
                        <Link href={item?.url}>{item?.url}</Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </React.Fragment>
          )
        })}
    </div>
  )
}

export default ReportPage
