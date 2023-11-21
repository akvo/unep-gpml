import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'

const slides = {
  en: {
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vStiiUBS868lnH-O_XzkUCNC184oIolV2Y0gRAZzqZycaPAsuwb_tI76HQOds1J9ms9MmJHfHhzxAgb/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vQVadfNdI02za5qsVWmXWv7d_q3AFdQ9jDsGGNyXw-K_RJ_q_ibXpoC-bVZCmNu4A-u1PGWi7K5Q9yG/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vRgQy9_4FirFZwNRcMW0BP-YQYvn5fNS-xtbZfSTZfjKTPAhZZk2BbV8L3oFLuQF73YFkkLVBKaJHX1/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vQpG8noXcmdZy2vlwCf2yK5Lw3Jkxqfatv2dlLYpUFfPMfhZo54QfA2_w3EpTc-qr30TspuKZwTaFqr/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vTVkldkpAgdAzCp79ADSb30n8iDayLEQc0-3BUplZ0GnMZ3DW5eCB1uk2dmCquD59F_R1Dm9k6yx4NC/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vTH20K8vipB6rvsVWSfL8IcUGpoSAbzQAXfOgu6RQtk1iluZt3WSTAReTfegA041IS2zsLBzCpFJun2/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vTjIs8GKQCIgcynmcpMB_KCQAsdJIPh64LGyBqyGCWXy7hbpxH0M_duVBmvLlvgEEB26P2tppLlNJQN/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vTNI5Efx1LJgL7LKgp5E_KisGYltIENRpbRx_YsFKeiSPKMBA5HYxqkDRSayz1PTSlAwtnXmndCgG_X/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vStLc6SxPEGgRWpNdL_TNSp8R3_Yt_Brp_uBXEdojWjvJ1oi9Nty7eD6IKfiEyUBEgIEG6cr_xiR68a/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vTzhVpFWM8nPUft1HS7MCEVYRfVgIog70JuVc8nvS7rzcySg4gApBdswodpVPdgcLFNIDeaWbqF9fqU/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vSgzdVItZTbIxg3ZG1iESOb2e6vFcQITlhZg0BdyY02wnQlE5uguduYvjZATblEIzA5D5qMxFOJf0dF/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vSP1Kh5nZBH_e705sADB4afB9AMiY-yf-SuOHH9-0EAm-zp7r8KocH4xVy5bXGomDUsDgQNQg14kNLO/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vRA2nVboE-6WOZ7Q-VsdkjKPalUFbvmX0RpLTkkiXYfLGvftrMia7XdSfTgIId46tIiEuRNu02hYIe2/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vSDfazrRbE_J2505vN9szLrx0JLid3VCXnDBzRdgW4HLRtfdHT6wsaX9Utg2DLEBmG3ulrlnQ_M0_B_/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vQFaWHLx8uelRgVzng-WRoXzk8wL420Nk8F6QYZ9h_h_3IBLSCbRptwTNvT4r6XxyQM5_gpRqJ_VLef/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vQqRwxNNVQP1Hq_2Mwg7ttGBtlGdz0rBCBpMY9iBPbf1psTI-T_dFGbvwktMavW8pAox9edoIfv7wFa/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vR5ydGUbxHDmh0Jz4H3z8qzAqv2oOSCx23CJk7sYHjmCzhU6CD8e4mlHih1i830wBItht9ayDjhBSKb/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vQzYwk2Pmc3AOdC6T9OOGq_UYK5mZXobOor8UcD9DO97x_-tKPQDWamE8tl9y4eC64hjOnn56szMBQe/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vQKGg1hUeUQlR838Vv2sLKuf1-UGmDp9koPpwEqZ9LvSUF-9bm8DWyBwx7tTepEnPQkNZDkNA1HWpk2/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vT9tm13MwhUjnHF6VtmXcHDZqQ3e-rYukhewD7eU_r4XAIp_0-t2Bp8H2zV4uqQMesNjqAMBk5cc1TH/embed?start=false&loop=false&delayms=60000',
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
        <Trans>description-intro-6-national-plastic-strategy</Trans>
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
