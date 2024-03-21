import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'

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

  const match = slideURL.match(/\/d\/(.+?)\//)
  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>Stakeholder Consultation Process</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Introduction</Trans>
      </h2>
      <p>
        <Trans>description-intro-2-stakeholder-consultation</Trans>
      </p>
      <a
        href={`https://docs.google.com/presentation/d/${match[1]}/export/pptx`}
        target="_blank"
      >
        <Button size="small" type="link">
          Download
        </Button>
      </a>
      <iframe
        src={slideURL}
        frameborder="0"
        width="900"
        height="542"
        allowfullscreen="true"
        mozallowfullscreen="true"
        webkitallowfullscreen="true"
        style={{ marginTop: 30 }}
      ></iframe>
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
