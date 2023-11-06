import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'

const slides = {
  en: {
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vSf3c54pKrJ2y9rffUiBB-rvG4JL49ZICs6gUARoNN29VWHnJrUrIWCEtpUyU41VhBU8PSaH2YJRhSX/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vTnuK_m7W0tNdNGE_nvPN-CAgptdmBxVwNUgza9_P5cJ1QgPCr1p2aRAiB9JGsVucbNY_kJFB_3te69/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vSv4CctAtfPS0veo6hTE467vhUFQ9n_st4qHJhhCGuxeQ6xjjOFTeO1mad7rophkO6iwUAdvJ87QZ0Z/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vQsp-1BKzfDe4AZEVjpiCEhZarM6KtQ1kxh4vs5YuF9F3HvmVsErKhg1w4TdjQ_HyjlKzcSA1E0AiV0/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vQz_A6M_KzV6dZmrK9-rUGZYM6QYgjB-7s0mvI2VdWzCXTlLFZC95L4dH5e1INU61MVtxWbm_nCzua7/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vQNTnbbtW9h4AgOnnud-kmFwWlNBRgk98U1mgtG8FIfjeAri1Cd3TZwNdZ4x0upkyliy7taDy2wJGCQ/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vShBzAfg-ETjJg7VO0zTRmN9Ov56sYS-THr9xhz1bnOSGjBNZl0Gw_AhddI21NTsHtK6Xgjxb7JtGdO/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vRqXNoTryCPn5F5iVEGWEpsarYhplo1Qs9eYHYQkjRM1zwjj5sO6Qkoq5tksr1sVBiSQY4nvVh9uhzl/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vTqZ5uzNmqGTm3X0Z5G-rpivML0aC9lNL4peR22C-KetTD6OrZ8T-CDosie9gTCz75Fe_5PEE8Pycbf/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vRTOG21oE4Zo3RF78VV_gr1ni-U6YSmkH4YijgCGmZpG-vp8JDNYE_43ySGlj90rNDOVD9xAb1uEB9a/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vRjsflU_xZopsi-wpPGa8jEqxeHbx57M1AdJ-aWEUiMmOYqBt07h-QnfoFROsfOqnxu380fH2l819jw/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vRJ-t8JEqWil6r4HFTPjg_svz_-URUfNUwFCIjgYmWY6nHlUqsJ9fywlxgTuwcBEyomsFFOKFnX6sZ_/embed?start=false&loop=false&delayms=60000',
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
        <Trans>Legislation & Policy Review Report</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Introduction</Trans>
      </h2>
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
