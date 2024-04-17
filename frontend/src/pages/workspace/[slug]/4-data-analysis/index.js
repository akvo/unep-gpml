import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'

const slides = {
  en:
    'https://docs.google.com/presentation/d/1svNMcbQxiPSPscTiIALfVKI849plCUfOer_bdFst69w/embed?start=false&loop=false&delayms=60000',
  es:
    'https://docs.google.com/presentation/d/1jNcIJSj_QCBC-GoMJPR9nqBXWdr1K9m_CVsrTUf4ChU/embed?start=false&loop=false&delayms=60000',
  fr:
    'https://docs.google.com/presentation/d/1_OuvGj8JU5zQOxJIAV-Pg-peMTZaHEErTaP_FN5ye0s/embed?start=false&loop=false&delayms=60000',
}

const View = () => {
  const router = useRouter()
  const slideURL = slides[router.locale]

  const match = slideURL.match(/\/d\/(.+?)\//)
  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>Data Analysis</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Introduction</Trans>
      </h2>
      <p>
        <Trans>description-intro-4-data-analysis</Trans>
      </p>
      <ul>
        <li>
          <a href="/State-of-Knowledge-Report-Template.docx" target="_blank">
            <Button size="small" type="link">
              Download State of Knowledge Report Template
            </Button>
          </a>
        </li>
        <li style={{ margin: '10px 0' }}>
          <a
            href={`https://docs.google.com/presentation/d/${match[1]}/export/pptx`}
            target="_blank"
          >
            <Button size="small" type="link">
              Download Slides
            </Button>
          </a>
        </li>
      </ul>

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
