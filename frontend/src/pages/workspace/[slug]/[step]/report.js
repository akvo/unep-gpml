import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './report.module.scss'
import { useRouter } from 'next/router'
import { stepsState } from '../../../../modules/workspace/ps/config'

const ReportPage = () => {
  const [bookmarks, setBookmarks] = useState([])
  const router = useRouter()
  const { step } = router.query

  const currentStep = useMemo(() => {
    return stepsState.find((s) => s?.slug === step)
  }, [step, stepsState])

  useEffect(() => {
    window.print()
  }, [])

  return (
    <div className={styles.reportView}>
      <span className="title">
        {currentStep?.label ? `Summary of ${currentStep.label}` : ''}
      </span>
      <h4 className="h-l">Approved Policies</h4>
      <div>
        <ul>
          <li>
            <h6>Title goes here</h6>
            <Link
              href={
                'https://digital.gpmarinelitter.org/knowledge/library/resource/category/?country=384'
              }
            >
              https://digital.gpmarinelitter.org/knowledge/library/resource/category/?country=384
            </Link>
          </li>
          <li>
            <h6>Title goes here</h6>
            <Link
              href={
                'https://digital.gpmarinelitter.org/knowledge/library/resource/category/?country=384'
              }
            >
              https://digital.gpmarinelitter.org/knowledge/library/resource/category/?country=384
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ReportPage
