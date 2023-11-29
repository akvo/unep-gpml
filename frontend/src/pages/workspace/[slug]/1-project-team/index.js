import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'

const slides = {
  en: {
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vQNMz6tpUDzSsoriaREwket_z3Ti27CVMXy3ewl7sNziRm51AtnwF0n-3isgH6AiB4yIiX2s4JCy-hS/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vSJWupz4I0eJAm4NIy-6TglC7AghwX136LsrmRL5I25izKDZiwH0okP-V5p4m4qhDn-dLkD2uICzw1D/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vQC0umSWsGfet23gaew25JVRA22GxKbZqt7cyMInPDoDkORmTVOqRnoKG8KdduEqPSXcg_9IF_tl5Rf/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vQLR9QkR2L3lNQ9Bb3TrMPLQU8DFbdIMyTnNKClCFLWzamcTXDEEffG6vKoXQM8IFRD6qiZBradQaE0/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vTxocw6aReBTL5IGTEVVWxU0-W2hIRIWKNBjcgcsEpuHSKM0TMOFHJLq11o0RXmOBcGbEbpjLa_WWNR/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vQWcv_zK7tNWOCcaj-MEOIRGDSABnl4Yjsp8ByW40hRxEQ_5NNzsGg7Zlv9-69UTNUohxD42kjivd4G/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vRhQYLvzZ5jEyrTA3ZnMQRrErlnFapiUYSE1NTtGTfyFtbAHnLYuSnKEdy1zYbKV8ioYf7Juw5VPiqW/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vTC5o8fSHaHcrqJD7oT2zF0gK3YNjdas9GvhbNQm4fcoNlf5E0gYPTKRr2r1gnoR77lHe_M0X5qf7Jw/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vQ22YJG8uNi5xT2tpwoCqilkp8K_9j6KqgAuSDPli78Sj0MneqfgVddWNAurXiciJQrNSA_qZg7IIR7/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vTX9ZxtfeNFQTrROSRqsf_Rqhl_U_0JpJ0rK5DscEOVNQCW3X7fl7Qv5tLZEXFRoskwDH2T201YeHw_/embed?start=false&loop=false&delayms=60000',
    'trinidad-and-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vQK4pY8rX2hK_1Vk768S885LY3N6Ebs017Bdmpw7lj8QVSNJ3md7QGQpdcR8VQIKgyo3YjG7kRSIbcj/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vTmXhZliSmvmUHMtHtW2JkTOGnawL0-t2Gf5MbXbLEryxyairQgCqSv0vZ1W2FDVGiDWO66BIf6G5hj/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vRrIgEIhaBLZweZ4BKS29rYpuwmWgAJniiE1GHKG2jFAm41U_HAsKey1u_YdjoTe8mXwltxJlKChGQJ/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vRYVN5_fvhpxkbm1jNx9otphV7AOrg6D25-F_8Vzq1ulh4JZtOEgGunVVJQpf83u-Gz9SYxfd4Viio_/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vQBk51dWtlmYqqc0VCw-eQr0bYYJrIYIj9baowmaaqTeu1ZWCjuV9IHxHFjDHTHHPUqesRJNv5vSNYk/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vT3Lnr2T-2FouuLJDR27pTtlEjnyDrwJ2mgvmR9Ic8t7ChabWdWFyhHoNUcIZlcs5uZExkhZNixHsW5/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vQwzPkPkpkf4jDLvBeBm0lya9zeGmvDZ7SWkt6fqz4Oid8jsBTeZEvvmIOfjlFAfKyAmvkzSF3YRLH7/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vR_t0F1Kh37lUkK6qzWTP6kgqxq02JJalsDH_F4Qo4YoQqHqkXzZRhMdpuMcAVEK_m5OonfuNiY6LIY/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vR4F5BsALtLmOTDBnKBaQbvdaFVZr6cDPJSmM89zrcIyXWC9rkpPjLAHblGcI-6kO0tsUeZrKzg_Ng2/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vTqbo-MV1YoH-3N5wVnC2nXgYQZpSF1W7zWp6Qkc9tQd6vHG5KlNPT4BSiWEDRTjthV9e5QOOIJwlIF/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vQVPe8sLq4opubk6ZcTcNWs8Rl6U7SpUoZjpL0ZSiCmbtvH85n_NucBZqjR1EhhKCmBxwRChrVjaJH6/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vQOKrV95x675PO3YIf2rTHXu4qaZPbLsty6sPPea9mpM5dxho1uGAQ3mbJwirzPLcgSfhftCI5F1tgf/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vTB2puAPSKowEBkeojkyTzIDpJYVIsIUAY_mwF0-nmap6PcJaMdQjxvp4xH_fkcIucdAj88mt68YjR3/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vRiDLlCwSXAMWOpT_NDkSIjToxgXelf3Gvq-xIccgq0K5HiBNT9FRBfk6jAUTtDCefAb7QA-RJ4mH39/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vQ6wv0uugwWdPXU4ObSBWDMFdxOT3-t9FKBwMmj_Z5F72O4vEJSJYjw-JBp7MkWXvH6okafW1gwgCWZ/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vSOhi2oTCssEZ0kqkoYcVs3rK5OXPytrzL2_axMLvlrDEjyuOq8dniuSHrDxjpDYSRwo88IUZLhBM7Z/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vQzGY2G2xWgA2nUrAv3UyoUQzPqoZ_8lxg2UV49LCv-JZSj6f6RCR2NX0M0MgiZBYf3OcH3oavrMaz2/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vRpLzo7ldkNxgp5ddHCtLnKXA_Kk6I2SWzgUUFC6DI7A7HhBhh5WQnTFBJebLdy8ANM8PpyG7xIQKwk/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vR6_2S3o14eGsYYvZQNl9HrgVkpxl5bARw4ed_-OjYhZ_bZD_38Mjvz-EunLYhri0h6pRjnY2WKk_sa/embed?start=false&loop=false&delayms=60000',
    'trinidad-and-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vTaP05_wrSwdb28-bfDFejkuFmCyombIkZlFGT1fwR1wFJaJZ_1ti9ZOD9ugom7APuoP0oGyvx2njcm/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vS9b4HA8vEY7acdv_uAT2Lg-IRmnA1_lpe9GzvBGR7Vg_2ZzeKRoFHs0nd8tknYJrFdRvfisNy3Bxmw/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vTwbzUGAHGgLeFBmkjQp0TeBBBSQ72OEKq6x140j4d5j4pCMnw_D2zpNFywUa7BaGlZ0Gkvrq03xLua/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vRcE57eStO9ByLqaA5-gC6R1YEbeabmeL6QOKI5_mokuLiEEAiHEIJJz3QNv3Pmt_-5xKj9ARcDNouW/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vS-tf9iRBuvwYf2GmbAxM10VhREO4qHYHa0F3_fQU18CKrZGvSki0ozVis9cRmZog2fk32ZKEbjaf51/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vTFC_CHUZzD3hLfMMWn6RcxTPTuWOHlynqJui6r6CfhS0LMbSuJhww06riAxtgyhR8lNmBeJ1r_JDeX/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vT05iPer7HA-2sDPlTf6pSUSYjrsKHcrBhWdB1CVhAfywXG78mVfAC3W2EEMxYGUKb6BrCagvJtbwGw/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vS5GnP1aft0XA3RfmWt2h2ewI2m8JuJzWY8mm59U07PWjEofOQ3ge90qI4BT3Pe1ExwvCeEEi_OBS2W/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vTEq8G_edzdQZsN4ALdq3-8f2X2weqKoEzWffc4lXXgpuWYqLmLw5bBP2Pm4vfg0dmfPFA7_7FXdT0f/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vTPrFqPmPiOr21BiME92BdJRs1AQXd9ak_cln1y619YWbl-7a8BohxmObwuPC9OExBnBYIgpl55lHze/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vRuZU7TZMN_SWFIBzS4V_2JNIlPSvp4SgtV3rxP4PTDrTYSs9aoc7Zl7_fg4vFR7zl2t5by3qYzmyEm/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vSD0CFHmFGRRiKL_mEGhraAsx6_7keZGYgWw02ccm6gICX8qpVuBycTvkNQ9nzaOkOh3yBs7nqz0JGm/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vS7xSZOk3JSjuk0SpJGL1S3VtcfXbC-poPMqIjl0iMdZ24_nFfRGgF3PpTre66SoKHKF_Xp3-jNfEWY/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vTKme6M57pvyTavhgVszYfXWEfP9A7xL1axfBMEhPWHF43kFidNkanQG_swV6m6eEjlKVwNSoR-HuqZ/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vT5CfnzqW6zVmTDWhdFQQbwF1Hawk8a4-kHdhOe5G7wkDjEwX33-D9dxmHyykzoi9g2kAKv-S7OJkTM/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vTAHCJoD850IiHwmbExZer08gZGuAsPAiFzPxo42gTBVQ6XUKMTbhhBjKsvc2VoR3qTLDdml7wbSJy1/embed?start=false&loop=false&delayms=60000',
    'trinidad-and-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vT_1LdUwuUhtVUjiVL24CqYFvvUQk3xzhqRwhmKblo7vz7UO7scWI9TyxfRd_t7YVPrdAyuL3pEI_XJ/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vQAvErBEUXoVwd_cIioinECyTkf_v0izRvP9x20Zc8rM5xJxBLulrBRSXI8NOkxbnm234cfPSseBNUb/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vTz2sfyrGheFdxACHkg90C_Ppyk8tOclItMEWdw7vUjLRNO4UNt8RTA9I8p3gjTwsq-GzbkOGF7UyG7/embed?start=false&loop=false&delayms=60000',
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
        <Trans>National Steering Committee & Project Team</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Introduction</Trans>
      </h2>
      <p>
        <Trans>description-intro-1-project-team</Trans>
      </p>
      <div className="iframe-container">
        {/* <a href={slideURL} target="_blank">
          <Button size="small" type="link">
            Download
          </Button>
        </a> */}
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
      </div>
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
