import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import { useStepInstructions } from '../../../../hooks/useStepInstructions'
import { MarkdownRenderer } from '../../../../components/markdown-renderer/MarkdownRenderer'
import { useRouter } from 'next/router'

const View = () => {
  const router = useRouter()
  const { data } = useStepInstructions('plastics-in-environment', router.locale)

  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>Plastics in the Environment</Trans>
      </h4>
      <h2 className="h-xxl w-bold">{data?.title}</h2>
      <MarkdownRenderer content={data?.content} allowSlides={true} />
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
