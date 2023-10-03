import Link from 'next/link'
import { Pointer } from '../../components/icons'
import styles from './ps.module.scss'
import { useRouter } from 'next/router'
import classNames from 'classnames'

const stepsState = [
  { label: 'Instructions', checked: false },
  {
    label: 'National Steering Committee & Project Team',
    substeps: [
      { label: 'Intro', checked: false },
      { label: 'Setup your team', checked: false },
    ],
  },
  {
    label: 'Stakeholder Consultation Process',
    substeps: [
      { label: 'Intro', checked: false },
      { label: 'Stakeholder Map', checked: false },
      { label: 'Case Studies', checked: false },
      { label: 'Initiatives', checked: false },
      { label: 'Summary & Report', checked: false },
    ],
  },
]

const View = () => {
  const router = useRouter()
  console.log(router)
  return (
    <div className={styles.plasticStrategyView}>
      <div className={styles.sidebar}>
        <div className="head">
          <div className="caps-heading-s">plastic strategy</div>
          <h5 className="h-m m-semi">South Africa</h5>
          <div className="progress-bar">
            <div className="fill" style={{ width: '20%' }}></div>
          </div>
          <div className="progress-text">57% complete</div>
        </div>
        <div className="steps">
          {stepsState.map((step) => (
            <div
              className={classNames('step', {
                selected:
                  router.query?.slug?.[1] === step.label && !step.substeps,
                opened:
                  router.query?.slug?.[1] === step.label &&
                  step.substeps?.length > 0,
              })}
            >
              <ConditionalLink step={step}>
                <div className="stephead">
                  <div className="check"></div>
                  <div className="label">{step.label}</div>
                  {step?.substeps && (
                    <>
                      <div className="status">0/{step.substeps.length}</div>
                      <div className="pointer">
                        <Pointer />
                      </div>
                    </>
                  )}
                </div>
              </ConditionalLink>
              {step?.substeps?.length > 0 && (
                <div
                  className="substeps"
                  style={{ height: 52 * step.substeps.length }}
                >
                  {step.substeps.map((substep) => (
                    <Link
                      className={classNames('step substep', {
                        selected:
                          step.label === router.query.slug?.[1] &&
                          substep.label === router.query.slug?.[2],
                      })}
                      href={`${router.query.slug?.[0]}/${step.label}/${substep.label}`}
                    >
                      <div className="stephead">
                        <div className="check"></div>
                        <div className="label">{substep.label}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const ConditionalLink = ({ step, children }) => {
  const router = useRouter()
  if (!step.substeps) {
    return (
      <Link href={`${router.query?.slug?.[0]}/${step.label}`}>{children}</Link>
    )
  }
  return (
    <Link
      href={`${router.query?.slug?.[0]}/${step.label}/${step.substeps[0].label}`}
    >
      {children}
    </Link>
  )
}

export default View
