import { PageLayout } from '..'
import { useRouter } from 'next/router'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import { useStepInstructions } from '../../../../hooks/useStepInstructions'

const View = () => {
  const router = useRouter()
  const { data } = useStepInstructions(
    'plastic-waste-management',
    router.locale
  )

  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>Plastic Waste Management</Trans>
      </h4>
      <h2 className="h-xxl w-bold">{data?.title}</h2>
      <div
        className="strapi-workflow-page"
        dangerouslySetInnerHTML={{ __html: data?.content }}
      ></div>
    </>
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
