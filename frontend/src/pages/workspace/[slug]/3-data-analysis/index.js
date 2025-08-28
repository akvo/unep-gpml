import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'
import { MarkdownRenderer } from '../../../../components/markdown-renderer/MarkdownRenderer'
import { useStepInstructions } from '../../../../hooks/useStepInstructions'

const slides = {
  en:
    'https://docs.google.com/presentation/d/1svNMcbQxiPSPscTiIALfVKI849plCUfOer_bdFst69w/embed?start=false&loop=false&delayms=60000',
  es:
    'https://docs.google.com/presentation/d/1jNcIJSj_QCBC-GoMJPR9nqBXWdr1K9m_CVsrTUf4ChU/embed?start=false&loop=false&delayms=60000',
  fr:
    'https://docs.google.com/presentation/d/1_OuvGj8JU5zQOxJIAV-Pg-peMTZaHEErTaP_FN5ye0s/embed?start=false&loop=false&delayms=60000',
}

const template = {
  en:
    'https://docs.google.com/document/d/1Cxf-40x4DGRNSySyGVvduXBeqb004PJDFRyie9QGMbQ/edit',
  es:
    'https://docs.google.com/document/d/1G6evaxe38dpqARty5j4Q96qD5gQD50tJPl7Dj1_cG8k/edit',
  fr:
    'https://docs.google.com/document/d/1Mk_8pO70EDtgUX6ADyR0j8xAUcad2AriPEMJ4yuciEI/edit',
}

const View = () => {
  const router = useRouter()
  const slideURL = slides[router.locale]
  const { data } = useStepInstructions('3-legislation-policy', router.locale)

  const match = slideURL.match(/\/d\/(.+?)\//)
  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>Data Analysis</Trans>
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
