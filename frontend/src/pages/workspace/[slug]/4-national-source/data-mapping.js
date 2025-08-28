import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import { useStepInstructions } from '../../../../hooks/useStepInstructions'
import { MarkdownRenderer } from '../../../../components/markdown-renderer/MarkdownRenderer'
import { useRouter } from 'next/router'

const View = () => {
  const router = useRouter()
  const { data } = useStepInstructions('data-mapping', router.locale)
  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>Data Mapping</Trans>
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
