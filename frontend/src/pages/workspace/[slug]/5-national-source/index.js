import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'
import { PREFIX_SLUG, isoA2 } from '../../../../modules/workspace/ps/config'

const slides = {
  en:
    'https://docs.google.com/presentation/d/1QOwkFVa18_UcbPzV5oVTpTVGqgjNAaP8jVZCaq78hIw/embed?start=false&loop=false&delayms=60000',
  es:
    'https://docs.google.com/presentation/d/1CeeXIBL6TFLsFdNi5iAwd3Mpg1CuKAq-lscaABzPq0k/embed?start=false&loop=false&delayms=60000',
  fr:
    'https://docs.google.com/presentation/d/1jXTVy4a5fahPQwnCl5vh0XAexICldXLnJn06lGhWIuo/embed?start=false&loop=false&delayms=60000',
}

const View = () => {
  const router = useRouter()
  const slideURL = slides[router.locale]

  const { slug } = router.query

  const [_, countrySlug] = slug?.split(`${PREFIX_SLUG}-`)
  const countryISOA2 =
    isoA2?.[countrySlug === 'cote-d-ivoire' ? 'ivory-coast' : countrySlug]

  const match = slideURL.match(/\/d\/(.+?)\//)

  return (
    <>
      <h4 className="caps-heading-m">
        <Trans>National Source Inventory Report</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Introduction</Trans>
      </h2>
      <p>
        <Trans>description-intro-5-national-source</Trans>
      </p>
      <ul>
        <li>
          <a
            href={
              'https://docs.google.com/document/d/1GLFfCrvY_-9Kr1-ZM0bjFmXt1_Ejo3nG/edit?usp=sharing&ouid=105922766546831874317&rtpof=true&sd=true'
            }
            target="_blank"
          >
            <Button size="small" type="link">
              Potential elements of a national source inventory for plastics
            </Button>
          </a>
        </li>
        <li>
          <a
            href={
              countryISOA2 === 'KH'
                ? 'https://docs.google.com/spreadsheets/d/1Cami7EJtTabFqVLFSU07T6-pwPAdjZGE/edit?gid=615205835#gid=615205835'
                : 'https://docs.google.com/spreadsheets/d/1fXG_jOQAr0LZM69v_h--h_OryI08NgZ6/edit?gid=912237927#gid=912237927'
            }
            target="_blank"
          >
            <Button size="small" type="link">
              Simple Excel Tool for Indicator Mapping
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
