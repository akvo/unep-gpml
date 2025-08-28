import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'
import { useStepInstructions } from '../../../../hooks/useStepInstructions'
import { MarkdownRenderer } from '../../../../components/markdown-renderer/MarkdownRenderer'

const slides = {
  en:
    'https://docs.google.com/presentation/d/19CCN4t6pvg1Cr0iYlljpAl6ToOgm8Po2l_fHDuSvFBA/embed?start=false&loop=false&delayms=60000',
  es:
    'https://docs.google.com/presentation/d/1YL7PuHZFWA5nyBnP0MiDYFL80srPzem8AjFMzed5gEA/embed?start=false&loop=false&delayms=60000',
  fr:
    'https://docs.google.com/presentation/d/1XFdzNQZTsz41HGmiJTJNS8PEA58v81-7wXfYM_NK7fw/embed?start=false&loop=false&delayms=60000',
}

const View = () => {
  const router = useRouter()
  const slideURL = slides[router.locale]
  const { data } = useStepInstructions('1-project-team', router.locale)

  const match = slideURL?.match(/\/d\/(.+?)\//)

  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>National Steering Committee & Project Team</Trans>
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
