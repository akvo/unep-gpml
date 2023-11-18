import { useRouter } from 'next/router'
import { PageLayout } from '..'
import Button from '../../../../components/button'
import { getParentChecked } from '../../../../modules/workspace/ps/config'
import styles from './index.module.scss'
import { loadCatalog } from '../../../../translations/utils'
import { Trans, t } from '@lingui/macro'

const View = ({ psSteps, allSteps }) => {
  const router = useRouter()
  const { slug } = router.query
  const incompleteAmount = allSteps.filter(
    (a, ax) => !a.checked && ax !== 0 && ax !== allSteps.length - 1
  ).length

  return (
    <div className={styles.finalView}>
      <div className="title-section">
        <h2 className="h-xxl w-bold">
          <Trans>Final Review</Trans>
        </h2>
      </div>
      <div className="desc-section">
        <p>
          <Trans>description-7-final-review</Trans>
        </p>
      </div>
      {incompleteAmount ? (
        <div>
          <strong className="h-xs">{t`${incompleteAmount} items are not completed`}</strong>
          <ul className="steps">
            {psSteps
              .filter(
                (s, sx) =>
                  !getParentChecked(s) && sx !== 0 && sx !== psSteps.length - 1
              )
              .map((s, sx) => {
                return (
                  <li key={sx}>
                    <h6>{s.label}</h6>
                    <ul className="substeps">
                      {s?.substeps
                        ?.filter((sub) => !sub?.checked)
                        .map((sub, subx) => {
                          return (
                            <li key={subx}>
                              <span className="p-m">{sub.label}</span>
                              <Button
                                size="small"
                                withArrow="link"
                                onClick={() => {
                                  router.push(
                                    `/workspace/${slug}/${s.slug}/${sub.slug}`
                                  )
                                }}
                                ghost
                              >
                                Review
                              </Button>
                            </li>
                          )
                        })}
                    </ul>
                  </li>
                )
              })}
          </ul>
        </div>
      ) : (
        <h1>
          <Trans>All done!</Trans>
        </h1>
      )}
    </div>
  )
}

View.getLayout = PageLayout

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default View
