import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'
import { PREFIX_SLUG, isoA2 } from '../../../../modules/workspace/ps/config'
import { useStepInstructions } from '../../../../hooks/useStepInstructions'
import { MarkdownRenderer } from '../../../../components/markdown-renderer/MarkdownRenderer'

const slides = {
  en:
    'https://docs.google.com/presentation/d/1QOwkFVa18_UcbPzV5oVTpTVGqgjNAaP8jVZCaq78hIw/embed?start=false&loop=false&delayms=60000',
  es:
    'https://docs.google.com/presentation/d/1CeeXIBL6TFLsFdNi5iAwd3Mpg1CuKAq-lscaABzPq0k/embed?start=false&loop=false&delayms=60000',
  fr:
    'https://docs.google.com/presentation/d/1jXTVy4a5fahPQwnCl5vh0XAexICldXLnJn06lGhWIuo/embed?start=false&loop=false&delayms=60000',
}

const links = {
  PG:
    'https://docs.google.com/spreadsheets/d/1CPFk9ZINBW8fF_kTuxcMeUCWFtIb1dbV/edit?usp=sharing&ouid=105922766546831874317&rtpof=true&sd=true',
  ZA:
    'https://docs.google.com/spreadsheets/d/1vHIvlz7UhCb-2tLXn2t6ftz9jhVhiMef/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  TG:
    'https://docs.google.com/spreadsheets/d/10cRzGmdO3WCu5kWKGD5B8ZGFXfhJZXTt/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  SN:
    'https://docs.google.com/spreadsheets/d/1XPRDt1psjFcOym-EyoPllwJasLZGw6f6/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  KI:
    'https://docs.google.com/spreadsheets/d/1ao2iw1r6TIHsBN0vWooJTUYjlBeqOh7r/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  VU:
    'https://docs.google.com/spreadsheets/d/1PQ1HP1aYn5RnIr2vtnR2hUsAdVfgIWfO/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  SB:
    'https://docs.google.com/spreadsheets/d/1rfk67RzhxxSgmYLC55uLIi5w9jZaU7H2/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  TO:
    'https://docs.google.com/spreadsheets/d/1ttr5xbPNjSNBhM_ZgV4jLCALC7JFwcGi/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  EC:
    'https://docs.google.com/spreadsheets/d/12x84tZtMBXKbngLlOz9ib6T8mIpRogE4/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  TT:
    'https://docs.google.com/spreadsheets/d/1846SEUKFe6PkB8UkKGnawfdgfz1OnR8I/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  KH:
    'https://docs.google.com/spreadsheets/d/1e9ODmNOc6xt2mLCybXiEm8tV_d4WH8Gx/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  TV:
    'https://docs.google.com/spreadsheets/d/1fRXbejhOw8VasLFs_7Ue1mvKOOFU-QpB/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  MU:
    'https://docs.google.com/spreadsheets/d/1_elWB9mLak5ENJed2FsMdJpik219hFmh/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  PE:
    'https://docs.google.com/spreadsheets/d/1TSR1ZoS1snOWjgME1Wbsrdv8bLDwvqgO/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  FJ:
    'https://docs.google.com/spreadsheets/d/1kVweuwwpfzkqK_BFK_IEBXFNiuG8xNSr/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  GN:
    'https://docs.google.com/spreadsheets/d/1BkUIjquHWKCLgB1Ns0LHZbu4Tw4aLLXg/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  CI:
    'https://docs.google.com/spreadsheets/d/1jupS1GJWVi19_lO6aC88tahO0-w_AsmY/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
  WS:
    'https://docs.google.com/spreadsheets/d/1AjbOsrbfwNoLL0w8UgMRdxX6o_M9Tac5/edit?usp=drive_link&ouid=105922766546831874317&rtpof=true&sd=true',
}

const View = () => {
  const router = useRouter()
  const slideURL = slides[router.locale]
  const { data } = useStepInstructions('4-national-source')

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
