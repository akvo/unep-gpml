import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'
import { MarkdownRenderer } from '../../../../components/markdown-renderer/MarkdownRenderer'
import { useStepInstructions } from '../../../../hooks/useStepInstructions'

const slides = {
  en:
    'https://docs.google.com/presentation/d/1g2ItBQes8CAcsPXYOFdOCH4Za9ZhfRjzrj9CrZxedF0/embed?start=false&loop=false&delayms=60000',
  es:
    'https://docs.google.com/presentation/d/16f0c-Ghw8od1fbvAlvGZb_ys6CT0u8HO3PGMYNRr_ds/embed?start=false&loop=false&delayms=60000',
  fr:
    'https://docs.google.com/presentation/d/1XIo97EscpP_pBvAEMD60cynE1kzsKeZ1zayZSEmbwfo/embed?start=false&loop=false&delayms=60000',
}

const View = () => {
  const router = useRouter()
  const slideURL = slides[router.locale]

  const { data } = useStepInstructions(
    '2-stakeholder-consultation',
    router.locale
  )

  const match = slideURL.match(/\/d\/(.+?)\//)
  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>Stakeholder Consultation Process</Trans>
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
