import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'
import { useStepInstructions } from '../../../../hooks/useStepInstructions'

const slides = {
  en:
    'https://docs.google.com/presentation/d/1x2XIOuTjEt0C7BvaZVWTLx_yANNmZeAROLGWyq_iEeg/embed?start=false&loop=false&delayms=60000',
  es:
    'https://docs.google.com/presentation/d/1GclN4c6Ox-TL6UyiGgtmNW6qg06nC8luXHd7fwJNbdY/embed?start=false&loop=false&delayms=60000',
  fr:
    'https://docs.google.com/presentation/d/1MqU2HXl1I3JdpdRQYlDfwrIvO7p92iHB-UU35TndW20/embed?start=false&loop=false&delayms=60000',
}

const legaSlides = {
  en:
    'https://docs.google.com/document/d/1YdUU8qh0awdjc-v88zA7V5-oI4b0abLfYR5VnRlpVsI/edit?usp=sharing',
  es:
    'https://docs.google.com/document/d/1n0DaWyPNDOsSLzTFTyYBW7jSZQSUVr5z/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  fr:
    'https://docs.google.com/document/d/1hbHGfQINoIrNcpQkh-3pmjzzNtt3JDgI/edit?usp=sharing&ouid=105922766546831874317&rtpof=true&sd=true',
}

const View = () => {
  const router = useRouter()
  const slideURL = slides[router.locale]
  const legalSlideURL = legaSlides[router.locale]

  const match = slideURL.match(/\/d\/(.+?)\//)
  const { data } = useStepInstructions('3-legislation-policy', router.locale)
  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>Legislation & Policy Review Report</Trans>
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
