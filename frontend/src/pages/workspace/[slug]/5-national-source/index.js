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
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vRH5QBeuZH3TGEe9RuIAPc7trqUbAFdCdIupZddArhD0ruKHYRcVy7Vp0iesVUNLHEiJ-zvM7KMe77_/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vQPPJp6xBPhgCvtI4NTE38aCeZYFigDgu9e1O_svVU0f_n1M0cMEUYLNou4Q9SwAd9AxDdxnLKSQW-F/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vRTuZfc65d6wymPI_RG_tPNbX2cv9aHeH5JhuHk8xNEd09Kmg3aF3TVuJpCDubYu0xM_xCA4JMsrk11/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vT3_N_ggbKKwqEdGCcw-Hy9tewOn-TPjfDXdu9gGpzazZ2LS4woDPD6XPjDSj__ZM4bne_-5XfaSBQr/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vSHnsx9CvUraz-gDLeq0kX62j42okTIDwHrGW0C7FKrdObGjJFWEVcv6qkrNhHEZsjU-LtU25cElHji/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vSdvVNxL6y_qrR-lCQkU-NYVas9l07oijk2gl58OATHaMYEHDRrtpf0N8VGKP7VCnSJ3PP5ACOcDjJl/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vTcSvUOFjs65h-QcmVlD6u9yriYsg9PuFb0bADDm8kZiG5su8TlPtheZQlCZvHSibBzjV_NjcNZNN2p/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vQbHpvdH8h6qP0QWjnQa3caPwImnSikJ2cmMdfRiW6XkJfpHIyqMSkDK0_EtezOBDwj8xuVjB3Z47FF/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vRRffhnk_2oqUDj_Co5KMsam4hMYjO6NUjuFwjZTIimlnU2x-nq3DdoaCcDhN0TlEaYwcHarZs05qaI/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vSyU9wypEK8oxUR7O016cTeoygOTQjyxLz9i_KP_VQKD77q-avxvRICHAXxjRf70b_6I1hJI1yrgM_m/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vR1jkGtqcd_e_QC4mmsP7_ymEzOcvjXCMuV0IP94KiVlAPHmyPg-FqnguLo_77gWJkYJuc4knkElVJI/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vRBO_L3as7YJ0VVZTG3gAo-fspkv7larwQnFG0mlg3X9HHlvRB4fVqsWaha5fgBoiCTICCJ_Qe-Mhuc/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vQ8_nBw4L0gvcNxABxG9Zc3c28It4dHvrEh_L5GZnZRu6B_FHQxcjaLgnbf9Or3OmgANkQmCkEkU20O/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vSvve3P8xakY4I11JJxyTDeDAfHRZPDlTWbQw-V8hARzGxvhTCt86dwLAry42zchS5A7ZOf8L2Dziin/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vQtxQ4NL3fzEObdJNJp5DWLCBnow9XJVhAWNFb-a_TV17FtZhF5oqEsY0Rgg5J9OGTI7KEqGY6SA_Tz/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vTEHiljftHomgVML8Je0y8f-jQF92xIJ_65uRXo-2aAA3lj0-0pczKzNEXtdjyJUR8pZFXa6VQeZdcM/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vT_F2Mq0Lw3ESPBcy12CAWRBQc-zJcll3aW9eWfkMaRRGXIwzMSKkZ_V1HrC6mgDn-B2XGbsPO34tl4/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vSLlR-1xOutMt6LNLT-auhXeDUt3KT_s5QOR3xIjyGgyZqxH3pVxQUejx_NBzzfoOn-2x06jIUSkBkN/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vQ6MiCU8B7uvNm4SEvdbu0gBY4E8vPV-q-0XsO4IHglP4c8fZFo8jCYPe--nK2tnBQo33ZxW8PwGrH5/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vR7yTQMTTC5PA2IHLpKSzsjaWp5GL6OM9LPukFqX340rwWPHpRcDf-EGjXZtSlTNVl0WPDN0tIvqb1E/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vR6pauDJP1N_pfhrNp0MrEdwc36MM8MweB__EEaEOIh_dU_HWvZIuChilXxilp4JK2GCRuoDtxmQ_4x/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vTKG1f4YyuudIrcYEdcNYwDKCIPKeHwkvh3HevQ4YbUvh0xLGTGkqI84b0r9mpvtz4upfBJFMNtAv7Z/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vTJVKDA2VU0DsfYU--9HdHKDsrO3zP-6TMZnrq1pi179AAkvifm3CsGM17RUkaTRvFvVx1YFMGc00hJ/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vQWlJrlz9c-TJ7fwSPZgsS5I8LFM96dNT5QdnGUwbJ5IadzBz7J-7NPFsFyz3dU2iQMRW6StGmu-1dT/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vSxuz9VO4eaa24qkE4MmWPMpAZiesnEw3da2ggKYz4rGegsGuKdqVgxTcFK_iUeW1AS3Pb_zNtbvze6/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vR9kcSj-c74gogQvG1EuZJak34W_YHFQV-GALFGkjx-jjCgwJRQZZ0sEu8rm-wVmCn5kxGHuM_VgH7_/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vTO7LIQvGkToPyCzDAYut-PHz9eUYA-7xTua5Qkfcc4UYhlFf5xch_8Zx9IqnVVgL5MCiF3-sjcYphk/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vScm0UO4TUH51dyqr9CenUhNNrMWH0fZnZXDkhRzJpMTQBlf-QkVaDYIBGYSsiQW7uiqMqkKAQrMH_H/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vQOZpsx5EEtzIjy7vMAex3emrgx8AIUEpEE9PiYm7Wa3610sKV-K1EA9Ji_efly8S4Kxiu_Fb5ikXbL/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vR_6NYnnKYkt9bogJDQ8cV8NXLIKQzNipMOepb3TBYuz3lM47fsIKK6o97s36bbkQncWcTwPD69SPCG/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vRMbhNIStu5WkyPFknlCY_OmoDQ8AkmbE6oTpqEe8-kfX8emHyMi66JFF1fCJYB2-P9OWqvxK7sCCX2/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vRK86sZUTISTV4zmlmuwIqU8fdC3OOzABLd_kUc-bkm4CXVUDClzu2hCET3zPTxqYV8PcCnFotqkEJ4/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vTu9GEtuYIr1-90Qv8nUD2zNfy-xhkooCgR7BIoE8DkHPrlvCzF1UQLJrbgKkZiQuUD-ryrhmxuaXKv/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vQ0E4p5FKLpJcRy_7tGpX-S6BQIhysB3WsOhG9AEIIHwXOMamz-cvE1awi1cVtgMOnNeKvnaabq_03V/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vT717SZjdpTiEMOnYXKDWNLBRD8xNjeSsOktt7pvjqFPsHdr2EPKWSe0gPVanhJNgAeKIBXBaTD4OhK/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vT-DeGF-_igX1TGcgaPsU3Kp9jqgcubGpyXUhYSdm6ua_p0ZbpKoc6qeScdyDJhpr6S76LXVXQNtGLq/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vQLpXcpJAqHVaVBJXBZq3eYjOV7VtUaZGDUit8c349tIa_DXO1Xyw480mv078RfFx6d5U5ftdnbExo1/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vRZqKIuSExIJQlSeruhAq5Lj1hke3sw7LW-Eno2WDAJ8jlkNMUjTR22goQ28z7SyiVEMYTSJZemPhqE/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vTdnkyfShBG5f5dHSmYreXJc9Q2pvCB42-dUKlztqAA7BJjMu_0ZYM0mFf4xe2oJJoNOEd-r22-6Vuw/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vRxrisxeGtFtEdUg_rWgUSsY9ILewhqyHz5LUUw_cxaDGhPZ-_Eh-jvzv8IE1XuXN2zzDl_U2iaIQfh/embed?start=false&loop=false&delayms=60000',
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
