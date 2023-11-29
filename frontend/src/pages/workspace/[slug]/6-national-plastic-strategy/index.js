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
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vQs_HU8Jy5-Kh9tcZLNwq8pHFKgE9ZLefgMMg5QjZcn5yKeML65WoqheeklPuIU5aJx8V4pgT6_uZtP/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vRn35Z8KO6LZjP01A8IoYCBr2Xoqbonbx-wDumyu4WOD5L5qh4brb3Q1W-Z4nncR3HXZySibyAYhfiS/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vTELjEYA2SN5eESXByg93Xbj4Lgr2L3QgHmQfL6j10NvQorC_TBfHQBljZZtj7zEUkOzc5V8EO-Cff1/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vSccStzKa66VdBw1PmMzqFlPYDHLKvVeWk2RTSL8_HIRArY-rJyp2FfKMDsZCRssB0QUjULusgkFSGr/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vQj176VtMOYO8KKVOsOrCzB-DSzMnkcvRv93Z1GVux9TzBDOOJZc6IngmYBqDwfBr9DuBcltpErcWKd/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vSOrb0sDWz8V-ljIDZacC890Hvbt13n8NaMRih9G-VBnlZbayYPV9BDV_mR0ZuKIFaU2NHprP5Q6En-/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vT4rOpOevh3z1BQENVLGEgZrQwnoohHD9BB-y9NuJll66e2g9EwU0SPdsdJGgDAA1wLtiWaCAsEVW3h/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vRIVwCUsvWuhEJMZqHxpY1ZSMrxRdHtK2MyhXqKe6n8niqwilepRQnuNZp4GwFViHBJPF8Hnewy4i9t/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vR3mhXpryHUkJMh2rp95GqIseILVMQ5hLrwwl0luiGTnvY2YfcwB5AUMiI3BZIl3nL_M3Crc0AHFYW8/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vRkAqfcz5q8gfp_SIE0Su7CmvhSf0AKXZ47ONfeRxavGj5ZZypzUrQGjZQUuie4oMKO0LkvxV0sNg84/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vQb04m9RWk3lLbcYemnxSLfGyK8PBqeqx9O72AMQv-XN4fQLeyVyunai1oPE-CuR6IAosa1JP4kwozC/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vRlGnG7bmDaHohJDlpTOSQ8btXewu6QXD_kZopDc8DivyjDC-oVsB25Ocjef9YlQE7GdmxOrs3hdbn4/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vStH8XrQCnUchj-ZPz039gz9dEdXgnyH3_RR4q7uXkYSZvOAmfLviUtWPwAJlW8kcgFut2iH2RW5RMC/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vTBd2EHrwS_6eAvp7tKpRvVTcHEFTgS-uEpDTGrI5X0gDoe7JtnYFYecrU2O9H5oU4rGV7ad12I5kaL/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vQKGg1hUeUQlR838Vv2sLKuf1-UGmDp9koPpwEqZ9LvSUF-9bm8DWyBwx7tTepEnPQkNZDkNA1HWpk2/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vT9tm13MwhUjnHF6VtmXcHDZqQ3e-rYukhewD7eU_r4XAIp_0-t2Bp8H2zV4uqQMesNjqAMBk5cc1TH/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vTNC78AI8DolrLGRn_85uq9H2YFOIHl4L02eYKR6Sp2K-bAUU3HgplPvuoJF2-LIk1tdb20YIcgEZ39/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vRPQ5EHvCwgvk0hnDSHFmcX5KF2MSMM76iZbYd7b27SZVh_E60IFXX6SarHYnz2qj906ZjAJ0_Ang5o/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vQ7jSQG3H1ONx8tpotB6hjMuVgjIZ-Fk-WTHWid-15-5PC1K99L0jYRBqCdbUmjYx1rYpVeQCyiyv53/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vST77kheG2v_xEJEzh8i3GEM5d_yWhyvm2WULPq-ubfu11xZJG6bP6m54fvmSVXZRTo9TODtQCDkHz5/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vSRTUMXo7qVD2KliFpOv-cIj_NzDaAtgCQ_no3WF5TcmwzrJSvp9Xsd4hNtoODA4k79YX3CDoYtAbwr/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vR_Zxll65rJt2m9ifC2ADO57970lRWae86oj5L8vB1LMg7zENny5fOslz2IUHyXHLq51284VG6ZJxWJ/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vSRaS2HFxpJrhj36vEuEBmV8HG-wMglf8ONAzlSyMsvH0J_0acG90aP2HENkaHsv1OSWZGXrDJkJbhd/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vQRtKyYWsxbFYo-VNMYQ0ZuL1WMMW5R_iX7fkcd36YRO3C8n7ZDgTW0RDTCmsaDasRC3u0jrEW4Qjll/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vTGMGR5pXOheuwtu1AjEFZciTdq1T9K72zR01PSr2F8UMQgWic69shAHga817HggXz4_jkiy62UvHAt/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vSEj75FgWYfcmmBLIQ2K4MixMIPGtmtfUzYWYVyPufaLNZsGtWiLkJ8qf6ELR3RVbRZkZQKJXt6UYxi/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vTQhyvdY4MWgu37SaFU2dmu-WsZ86fXA3RKQuFKEiOn7CB8wrXZNNAEeEQkl8xqHra5cJOCUN_fBFoA/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vTeEh7t6HQrFY3Frz-2unPGjbI6SD3zvkOHDSgkzsMeyr8_QE9C5BBJOr1F7yxydZeXX9lDCR7ioYFm/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vQhzNGGsSBCY_WXneI_NSAge--FOh29hU58Co4g3o2syDxcRmuOAtGu6WH9O3pZReq4aRTe3bKIyQkK/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vRZftsffIfRd_iawsAC7lUSSMZbDIUVIaowXZVp127l4nx9_w84GhOF6WntLVJLIHKd0LCEUCwGTygJ/embed?start=false&loop=false&delayms=60000',
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
