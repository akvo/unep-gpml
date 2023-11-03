import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { message } from 'antd'
import { Pointer, Check, Forum } from '../../../components/icons'
import styles from './ps.module.scss'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import Button from '../../../components/button'
import {
  PREFIX_SLUG,
  getParentChecked,
  isoA2,
  stepsState,
} from '../../../modules/workspace/ps/config'
import { Trans, t } from '@lingui/macro'
import { UIStore } from '../../../store'
import api from '../../../utils/api'

const stepsDict = {
  Instructions: t`Instructions`,
  'National Steering Committee & Project Team':
    'National Steering Committee & Project Team',
  Intro: t`Intro`,
  'Setup your team': t`Setup your team`,
  'Stakeholder Consultation Process': t`Stakeholder Consultation Process`,
  'Stakeholder Map': t`Stakeholder Map`,
  'Case Studies': t`Case Studies`,
  Initiatives: t`Initiatives`,
  'Summary & Report': t`Summary & Report`,
  'Legislation & Policy Review Report': t`Legislation & Policy Review Report`,
  'Country Policy Framework': t`Country Policy Framework`,
  'Legislative Development Guide': t`Legislative Development Guide`,
  'Data Analysis': t`Data Analysis`,
  'Available Tools': t`Available Tools`,
  'Available Data & Statistics': t`Available Data & Statistics`,
  'Data Collection': t`Data Collection`,
  'Calculation of Indicators': t`Calculation of Indicators`,
  'Available Information': t`Available Information`,
  'National Source Inventory Report': t`National Source Inventory Report`,
  'National Plastic Strategy': t`National Plastic Strategy`,
  Upload: t`Upload`,
  'Final Review': t`Final Review`,
}

const NestedLayout = ({ children }) => {
  const [psItem, setPSItem] = useState({})
  const [marking, setMarking] = useState(false)
  const router = useRouter()
  const pathSlugs = [...router.route.substring(1).split('/'), '']
  const { slug, step: stepURL } = router.query
  const profile = UIStore.useState((s) => s.profile)
  console.log(router)

  const getBySlug = (step, _slug, indexStep = 0) =>
    (step?.slug === _slug || (step?.slug === '' && !_slug)) &&
    indexStep === step?.indexStep

  const psSteps = useMemo(() => {
    /**
     * Always use the SLUG from the config file (stepState).
     * Just in case the SLUG from BE is different from the latest update.
     */
    return psItem?.steps
      ? psItem.steps.map((step) => {
          const findStep = stepsState.find((s) => s?.label === step?.label)
          if (findStep) {
            return {
              ...step,
              substeps: step?.substeps?.map((subItem) => {
                const findSubStep = findStep.substeps.find(
                  (s) => s?.label === subItem?.label
                )
                if (findSubStep) {
                  return { ...subItem, slug: findSubStep.slug }
                }
                return subItem
              }),
              slug: findStep.slug,
            }
          }
          return step
        })
      : stepsState
  }, [psItem, stepsState])

  /**
   * Extract all steps due to counting all checked = true items
   */
  const allSteps = psSteps.flatMap((p, px) => {
    if (p?.substeps?.length) {
      return p.substeps.map((sb) => ({ ...sb, indexStep: px }))
    }
    return [p]
  })

  const currentStep = useMemo(() => {
    /**
     * Get current step based on path/slug/segment's URL
     * @var indexStep = index key to find parent/outline step.
     * @var child = last segment URL to find current substep.
     * @var isCompleted = current checked status to validate the step is completed or not.
     */
    const [_parent, child] = pathSlugs?.slice(2, pathSlugs.length - 1)
    const parent = _parent === '[step]' ? stepURL : _parent
    const indexStep = parent ? parseInt(parent[0], 10) : 0
    const findBySlug = allSteps?.find((a) => getBySlug(a, child, indexStep))
    const isCompleted =
      findBySlug?.checked || getParentChecked(psSteps?.[indexStep])
    return { indexStep, child, isCompleted }
  }, [pathSlugs, psSteps, allSteps])

  const progress = Math.floor(
    (allSteps.filter((a) => a.checked).length / allSteps.length) * 100
  )
  const isCompleted = !psItem?.id || currentStep?.isCompleted

  const handleOnMarkAsComplete = (checked) => async () => {
    setMarking(true)
    const { indexStep, child } = currentStep
    const updatedSteps = psSteps.map((s, sx) => {
      if (sx === indexStep) {
        if (s?.substeps?.length) {
          /**
           * Find substep by slug and update the checked status
           * @var child (last segment URL)
           */
          const substeps = s.substeps.map((sb) =>
            getBySlug({ ...sb, indexStep: sx }, child, indexStep)
              ? { ...sb, checked } // Update substep's checked status
              : sb
          )
          const allChecked =
            s.substeps.filter((sb) => sb.checked).length === s.substeps.length
          return {
            ...s,
            checked: allChecked,
            substeps,
          }
        }
        return {
          ...s,
          checked, // Update parent/outline's checked status
        }
      }
      return s
    })
    try {
      /**
       * Send updatedSteps to BE via PUT method request
       */
      await api.put(`/plastic-strategy/${psItem?.country?.isoCodeA2}`, {
        steps: updatedSteps,
      })
      // Update steps state
      setPSItem({
        ...psItem,
        steps: updatedSteps,
      })
      setMarking(false)
    } catch (err) {
      console.error('Unable to mark as complete:', err)
      message.error('Unable to mark as complete')
      setMarking(false)
    }
  }

  const handleOnNext = () => {
    const { indexStep, child } = currentStep
    const parentStep = psSteps?.[indexStep]
    if (parentStep?.substeps?.length) {
      const parentPath = `/workspace/${slug}/${parentStep.slug}`
      const subIndex = parentStep.substeps.findIndex(
        (sb) => sb?.slug === child || (sb?.slug === '' && !child)
      )
      const nextSubSlug = parentStep.substeps?.[subIndex + 1]?.slug
      if (nextSubSlug) {
        /**
         * Go to the next substep page
         */
        router.push(`${parentPath}/${nextSubSlug}`)
      } else if (psSteps?.[indexStep + 1]?.slug) {
        /**
         * Go to the next parent/outline page
         */
        router.push(`/workspace/${slug}/${psSteps[indexStep + 1].slug}`)
      }
      return
    }
    if (psSteps?.[indexStep + 1]?.slug) {
      /**
       * Go to the next parent/outline page
       */
      router.push(`/workspace/${slug}/${psSteps[indexStep + 1].slug}`)
    }
  }

  const getPlasticStrategy = useCallback(async () => {
    /**
     * Get actual PS data from the Backend
     */
    try {
      const [_, countrySlug] = slug?.split(`${PREFIX_SLUG}-`)
      const countryISOA2 = isoA2?.[countrySlug]
      /**
       * Make sure isoA2 code is valid and profile id is exists
       * @var profile?.id = if profile id is exist then the API token should be present and valid for auth purpose.
       */
      if (countryISOA2 && profile?.id) {
        const { data: psData } = await api.get(
          `/plastic-strategy/${countryISOA2}`
        )
        setPSItem(psData)
      }
    } catch (error) {
      console.error('Unable to fetch all PS:', error)
    }
  }, [slug, profile])

  useEffect(() => {
    getPlasticStrategy()
  }, [getPlasticStrategy])

  return (
    <div className={styles.plasticStrategyView}>
      <div className={styles.sidebar}>
        <div className="sticky">
          <div className="head">
            <div className="caps-heading-s">
              <Trans>plastic strategy</Trans>
            </div>
            <h5 className="h-m m-semi">
              {psItem?.country?.name || t`Loading...`}
            </h5>
            <div className="progress-bar">
              <div className="fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-text">
              <Trans>{progress}% complete</Trans>
            </div>
          </div>
          <div className="steps">
            {psSteps.map((step) => (
              <div
                className={classNames('step', {
                  selected:
                    (pathSlugs[2] == step.slug || stepURL === step.slug) &&
                    !step.substeps,
                  opened:
                    (pathSlugs[2] == step.slug || stepURL === step.slug) &&
                    step.substeps?.length > 0,
                })}
              >
                <ConditionalLink step={step}>
                  <div className="stephead topsection">
                    <div
                      className={classNames('check', {
                        checked: getParentChecked(step),
                      })}
                    >
                      {getParentChecked(step) && <Check />}
                    </div>
                    <div className="label">{stepsDict[step.label]}</div>
                    {step?.substeps && (
                      <>
                        <div className="status">
                          {step.substeps.filter((sb) => sb.checked).length}/
                          {step.substeps.length}
                        </div>
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
                            (step.slug === pathSlugs[2] ||
                              stepURL === step.slug) &&
                            substep.slug === pathSlugs[3],
                        })}
                        href={`/workspace/${router.query?.slug}/${step.slug}/${substep.slug}`}
                      >
                        <div className="stephead">
                          <div
                            className={classNames('check substep', {
                              checked: substep.checked,
                            })}
                          >
                            {substep.checked && <Check />}
                          </div>
                          <div className="label">
                            {stepsDict[substep.label]}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div
              className={classNames('step forum', {
                selected: router.pathname === '/workspace/[slug]/forum',
              })}
            >
              <Link href={`/workspace/${router.query?.slug}/forum`}>
                <div className="stephead topsection">
                  <Forum />
                  <div className="label">
                    <Trans>Forum</Trans>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.view}>
        {children
          ? React.cloneElement(children, { psItem, psSteps, allSteps })
          : children}
      </div>
      {router.pathname !== '/workspace/[slug]/forum' && (
        <div className={styles.bottomBar}>
          <Button
            type="ghost"
            onClick={handleOnMarkAsComplete(!isCompleted)}
            loading={marking}
            className={classNames('mark-completed', { completed: isCompleted })}
          >
            <Check />
            {isCompleted ? t`Completed` : `Mark as Completed`}
          </Button>
          {!router.pathname.includes('7-final-review') && (
            <Button onClick={handleOnNext} withArrow>
              <Trans>Next</Trans>
            </Button>
          )}
        </div>
      )}
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
