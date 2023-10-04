import Link from 'next/link'
import { Pointer } from '../../../components/icons'
import styles from './ps.module.scss'
import { useRouter } from 'next/router'
import classNames from 'classnames'

const stepsState = [
  { label: 'Instructions', slug: '', checked: false },
  {
    label: 'National Steering Committee & Project Team',
    slug: '1-project-team',
    substeps: [
      { label: 'Intro', slug: '', checked: false },
      { label: 'Setup your team', slug: 'setup-team', checked: false },
    ],
  },
  {
    label: 'Stakeholder Consultation Process',
    slug: '2-stakeholder-consultation',
    substeps: [
      { label: 'Intro', slug: '', checked: false },
      { label: 'Stakeholder Map', slug: 'stakeholder-map', checked: false },
      { label: 'Case Studies', slug: 'case-studies', checked: false },
      { label: 'Initiatives', slug: 'initiatives', checked: false },
      { label: 'Summary & Report', slug: 'summary', checked: false },
    ],
  },
]

const NestedLayout = ({ children }) => {
  const router = useRouter()
  // console.log(router)
  const pathSlugs = [...router.route.substring(1).split('/'), '']
  console.log(pathSlugs)
  console.log(pathSlugs[2])
  console.log(pathSlugs[3])
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
                selected: pathSlugs[2] == step.slug && !step.substeps,
                opened: pathSlugs[2] == step.slug && step.substeps?.length > 0,
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
                          step.slug === pathSlugs[2] &&
                          substep.slug === pathSlugs[3],
                      })}
                      href={`/workspace/${router.query?.slug}/${step.slug}/${substep.slug}`}
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
      <div className="view">{children}</div>
    </div>
  )
}

const ConditionalLink = ({ step, children }) => {
  const router = useRouter()
  if (!step.substeps) {
    return (
      <Link href={`/workspace/${router.query?.slug}/${step.slug}`}>
        {children}
      </Link>
    )
  }
  return (
    <Link
      href={`/workspace/${router.query?.slug}/${step.slug}/${step.substeps[0].slug}`}
    >
      {children}
    </Link>
  )
}

export default NestedLayout
