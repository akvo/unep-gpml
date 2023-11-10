import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'

const slides = {
  en: {
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vRfxyN-YQjIPTlOl70NL2BwEIvBJWLTkxGNNTdnifhDUhrbZlA4kILsTHOhdHDcjHHId1F9XroTzh-i/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vSUp2NOFSo9hWVNL7He-vsxmUBcSIfkMoYX01-Y5pNiKnnHbm0xC_TO_-WO7QqMSikP3gGItbdEpKEM/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vSV-CAeJQ05hSQnBsyRL65PQf3hdTp0a_u0tG8_8RpDdQubUHuoWjJe71EjITMif0SQ72hsUHZBgsU0/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vQeGEgu0EmWQLYLgJm2dmnFx8pZ7_dmMBudrcENvSzDTFTx7JUsuwQIMRvjpi92G0jrY-BtR-wkJlCr/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vSmPFKDy93dSSMh0Jvf5Jcm1aSTvVTz0nNzJT0VGP9Hal34T7kIDN50WDlRiPcU0nAateN701dGodkB/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vSYmr_rgkoLvg4xfJ1Cq78IG9MiGzUhjMJ82EKs_ewf-4-wx6uXfckwlD_rZcfUmDEc3-RDvXtp4R3t/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vRsvgR7m2ueHWFC3OtJROucySLXsaNv88DUl96UBUL7qCOZVVJu61ccwaiFSnfl2YBUiMJhI7jbwyoN/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vSKv7jwEJQ-YeQSmq4DVCRyTW0CPDuCbgEaDBiBByAydrjnd-IsLLjGgZaP2qCEGAWwMroE7pqAaTkP/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vRRffhnk_2oqUDj_Co5KMsam4hMYjO6NUjuFwjZTIimlnU2x-nq3DdoaCcDhN0TlEaYwcHarZs05qaI/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vSyU9wypEK8oxUR7O016cTeoygOTQjyxLz9i_KP_VQKD77q-avxvRICHAXxjRf70b_6I1hJI1yrgM_m/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vSxuz9VO4eaa24qkE4MmWPMpAZiesnEw3da2ggKYz4rGegsGuKdqVgxTcFK_iUeW1AS3Pb_zNtbvze6/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vR9kcSj-c74gogQvG1EuZJak34W_YHFQV-GALFGkjx-jjCgwJRQZZ0sEu8rm-wVmCn5kxGHuM_VgH7_/embed?start=false&loop=false&delayms=60000',
  },
}

const View = () => {
  const router = useRouter()
  const country = router.query.slug?.replace('plastic-strategy-', '')
  const slideURL = slides[router.locale].hasOwnProperty(country)
    ? slides[router.locale][country]
    : slides.en[country]
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
