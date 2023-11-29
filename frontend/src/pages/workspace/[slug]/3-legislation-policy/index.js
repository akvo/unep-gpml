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
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vTQoKvAGszBmKtDH7a5u_OYFBIq7Ff9OIrcDlb8eULUaYDnuBiE6QI3tfbfQF0yHkVFhVbspz-hvQtj/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vSMXvV0iVxvO2MVDiO7H3Fh5R2bn4uEe5a4AQn9JT6fVHPAiyAM2J234ZHfB32GcXRhZkJae5wJ3PSr/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vQtX_YX0vPjpyjGGARcz7ohQ1kYRiwiJuY66eqmYaWOcESNzCSh9Hd8WHAlmUITk5Fu1nYf7Qy5kEYZ/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vT478h69j7uWN5G7ze2amomUmLxOQPb6FrcX9QxthgzqCX0NoQ285f7BM1bZxIanuhT2A8d3RjwNB2J/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vQZOPsL6tnY9jeZ_YVgGYv6jd2Lv7vPglL1e1l_MWkgUq3uv0mJo3xrcQgPRQJoXSROAiYJM2VAAUkD/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vR5HhJubzoXETZJN1PZ1ua6sfUXxqcQ-_q61gSSQUXXriFGPzY3GcWRPJr5bNIoViKyKwTKWwzM9k7N/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vSDTr_ryJUkyZ9lP0L9dXAdC4KyKZW0hzERDXddu8L-OeS25sZSCX7hnokTQ52Xxrc73ddutTwUa3-H/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vSkubuCt3XuDr_ehoWK0NAMUrwfVUqT3XqVyehwXOz7EqYeaH2e2VFHWlJGwR9Z-GUnkhMIJ-OB72SW/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vTqZ5uzNmqGTm3X0Z5G-rpivML0aC9lNL4peR22C-KetTD6OrZ8T-CDosie9gTCz75Fe_5PEE8Pycbf/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vRTOG21oE4Zo3RF78VV_gr1ni-U6YSmkH4YijgCGmZpG-vp8JDNYE_43ySGlj90rNDOVD9xAb1uEB9a/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vRqYDeI-A1uyQwFLAmwdLaLIu69xIrSTROB0ZjJfmZjpZOhOrw6jaqj7DZDtV0G8qtdnaNE7t80394Q/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vQjqb3CeEM9e5Z5_pbNoxOhzYwT8QU9UXhy8XLO7rnIJZ1z0zmTQkNtn724rCmL_ot6C5YH-H4WfKLc/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vRimMluHwWzkVZ88HvEPNqBJeDe8K1ULA43inuTcSJazydmKHnNgh86gKhX1ewLN4bRc1Bc1qG3wV0n/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vR4135pdUBD47LuIpqRNrO926saWpDyRDW09FFTqwcKh4T3KSdmHChWRQIYiaGvon19U5uuN4O7_EN-/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vSnsT-0bPQDzajyBisz_mRZwFUkSlLoCTfsqb3Dbz9OCYcfrG8H0DkP6KhDRNcmuJLJ7T1x9nfbHELh/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vRRQwqiKFZbckkOOTA2onM4Xha-imSwZBXv2KSbsKECyTuudSCSB4PbevdIrjxGCO-bCI4OwEehl-0S/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vTYHHoaXOuUKNJghCecf7OGRngws5AzraCZjryghBAS_yuKRVK0gXoWkRZccLTkMv_huRD0K87DVwmu/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vQ8TdpeQzzYVHCy16JJNim1LDKOQTfe-1XrdeODrkdwgjPUwdNbebBR0OeFw1Ls6cgctmbPZNA7AaSj/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vRNedKqKXIZUJmHACRaB3M03ZVDl4e1wfjrORoJzWQzq1d_QHHBFHopgh2cNoaf-djzETao-zu0jXjW/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vSmf-j0s5CDteUUw_PaF3eg00wGYLF8CdoWPaFGEjGtNJgydq6CvuLNmerJ8_TOv8RkQ8UZiAkb7MJN/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vR8UpjZdDZ2btHLVLjNdU1h1eNnT8oAqu5q1qbGW-bpdquGo7SmPlPNY8_EWGoYTsPpwwTpg0yVcD53/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vSgC749aiWGwE0ezvXs0wFBTUCN83t-jXiew2vKgwWXBzV6_bVOJ-mPg-bm7GLfNXDRcCJCiC7tAImU/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vQgvK9AgMu_9PpUiaBpJF7uXU4eXcgl4ZHUcJ0S26MmSAq8ZhrCZGPQUXSqAvr2nrk75uiV1MEPUGjq/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vSm1E9E1Ua55jpZAlhyyV7XNKh1-kcFNdo-3wDjRTEoq61Qx1__tQzxHq9hD3VXlJKSg82-AdfuYq_m/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vRjsflU_xZopsi-wpPGa8jEqxeHbx57M1AdJ-aWEUiMmOYqBt07h-QnfoFROsfOqnxu380fH2l819jw/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vRJ-t8JEqWil6r4HFTPjg_svz_-URUfNUwFCIjgYmWY6nHlUqsJ9fywlxgTuwcBEyomsFFOKFnX6sZ_/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vQxlkMpYs3infdkqbhrCftsmoQXIl2M5f9dq2p7iV5f4e5kG0nXmXqQvgUOz-yxgxK7hXRsxtEG5ani/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vRSqoN2xJzFduIbLlcoaNOfu1m1bdlA6FIkTCqpi6m4MBCJT6ie_KiqJ_QPH8iNAZDkhjJMz1z4pYv0/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vThcmXaG6oqfkxIipwJisaRGnouAJtI16k_8p7tkG8ib7rF-SZqh2Ox0mo9EcsEkDn_HO8RHKi8CIiw/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vR2dy0DvQBqE9zj4lC4iJcxVbCTfkD6afbbUq8Xi2bmWYxecGzmi4Y0ti4FaA8ytdfBChiSAOhaCe9k/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vRf9tyNRbWbVWf7rzytnjkzuq3_w1F78lE9-ZSyRL_Z7ZkdjqY52rKuLBIgfVBxril4mixUS_V3f9xz/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vStazRV5RvHIweFREq2IgD-_XqVbxFqcmxhBZ-5fcTvcokU6pqJbfVKsVssrCUmevLKP_VPJ2KHtrDd/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vTG_PGHEyuTPeySHlXjxmINS9uSFaSFTiXwvjQ1pJjpp4rqSBJwDlhHNrcTTHqsNlKqDsJQ5_36N-a-/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vT9iuJvy0unN2ayxH_qQLzLsOX8qlf1hxe7UjqId0kMdfjvYR_hu6WR83biWuF7gYfXj_5QF1mxDyEQ/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vQ0jnZQBTl8AAzOwFV8w5CNWIC3_oGME-61oHObedB3sUaxz5yL3ckhD9sVJyIYRaKvFMxHPT6YTJ1A/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vR_JLJEAoH_-sjRmOL-7pCU1w9jiNaFR0mBm6fHzcOvrtbpWPeQL1rqWT9zayQk8HlnEKj-hoNLcuc5/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vSAHtgsZP4rWuAjpurBH9N3oBByAUieuSY34M-EqdOpFwFxuAgti6pKstv2ap3DKbpaM2zdIHgjmmUu/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vSX1tWMluuPw-IfhOmCeTsG57mE39nfARc8SQY_MFKw_NpqmbnDpIQCNonyoDMfXuETC3qD1FGKSgI7/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vTWinO1SNO_PSW-eLFXZGPGNiciw13g2K9lYRUuQG_zxTo2b0DC1gOrhK4e06FH5qLjtKpVUB3v6oL7/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vQAxpRBZzMxrnnZ-0F5rDJYx-mc9KKjQKH6pjhBpx0loixKtTHPv2A-yc85u8w5OFXQPzATLA9V8lNj/embed?start=false&loop=false&delayms=60000',
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
      <p>
        <Trans>description-intro-3-legislation-policy</Trans>
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
