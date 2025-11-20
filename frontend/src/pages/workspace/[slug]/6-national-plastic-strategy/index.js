import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'

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
  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>National Plastic Strategy</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Introduction</Trans>
      </h2>
      <p>
        <Trans>description-intro-6-national-plastic-strategy</Trans>
      </p>
      <ul>
        <li>
          <a
            href="https://docs.google.com/document/d/1y37NoY4c51ztstQeOzHCvS8hIkVY698i/edit"
            target="_blank"
          >
            <Button size="small" type="link">
              Potential elements of a National Plastics Strategy
            </Button>
          </a>
        </li>
        <li>
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
