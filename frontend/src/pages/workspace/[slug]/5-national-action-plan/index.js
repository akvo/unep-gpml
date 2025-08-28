import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'
import { useStepInstructions } from '../../../../hooks/useStepInstructions'
import { MarkdownRenderer } from '../../../../components/markdown-renderer/MarkdownRenderer'

const slides = {
  en:
    'https://docs.google.com/presentation/d/1Vn_F3FpQmbRSJxePKLhkJqY9Dwv7H39g2oYwkAiwsSY/embed?start=false&loop=false&delayms=60000',
  es:
    'https://docs.google.com/presentation/d/1DrsCbGRCRvx-tBQOvZlMlBsn6cJxQhFhULx7ZMYa2ZQ/embed?start=false&loop=false&delayms=60000',
  fr:
    'https://docs.google.com/presentation/d/1NpMiVBsMN0adJSHJJ83lMeOUb0pBIKm68JZqBFqy0wI/embed?start=false&loop=false&delayms=60000',
}

const View = () => {
  const router = useRouter()
  const slideURL = slides[router.locale]

  const match = slideURL.match(/\/d\/(.+?)\//)
  const { data } = useStepInstructions('5-national-action-plan', router.locale)
  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>National Plastic Strategy</Trans>
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
