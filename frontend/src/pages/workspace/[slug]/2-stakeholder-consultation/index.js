import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'

const slides = {
  en: {
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vQF0WjbDpcphOib7zdBF4TkvChgQOmUUh5fIGnxej48Tj3CcwG_FcIPO6Xyk73pGOHzxiYY46DZOoXG/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vSh0XoYcx0iFm3vKYww4VIVfdNV3NUQWzV_9AtK0N0KKfSeEt-zZTzg8eEcH9iLGEEE03bz4rpMaESf/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vS3j_NI-t3e2ya4v4Tufbkaks6ZvaBoxgZ3K335CW9CwrBIsAsY56afJwwrlhaggyD4kwPKUNY-E-HX/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vRLn9-NPp7n4cjPmWzignnNi9F4l-_nMDUfbQ9C7hm80CUB3GdBeAwQhkDLvueWBSwIUn5gsRi2E71S/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vT8rHQWKm8X8NR6OTYJkELADaruZ6wPyDuMmjDlvuOYBkYo2Rg_dHIoA6iNytHQwqP0J5TtmLB_Ew-W/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vRwWXJDDN7Dhz757HV5f8YE7fFfAXwjt3LUt8FN1IA3b-iRAjlbDOzpfbGPdHyn-kOOiN-PVWQ4EzLq/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vR3vJYIcwUs-oOwdsdH2Hsn6bcqe_UzZD6R-Onqj_4Z3Q-esh0MqMNNfXcdMQ3OwMIW75O1ERxAGcL3/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vRjRLUKxgxCkDeijy7fkIDloFcL6W4WsOJHZoiD1s42ZAXzsfdB0waxtaLRaUE15VZTEuk7D7GuHi73/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vRkfN2HTcWyTOtxdnSqKklcdPI72l_krTXSVR_sdr1_FzAg4CIm4dHi2IhoutxCUDq7CTBo2QvvpZ60/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vS6XFs57102G378lKKeFN8SYPKy2SznIrqmpDzJqm6b0TFkZ5vpgjjnycayvBw9N8Qh2gR3P86NmA_c/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vQnIdUKEyjMS7aiSh9Qqra9DPMwTlPBLaZc2rKaGGc5w0qGVtK9OltU9qsdhBXvgs38dDHGHWaLkIgv/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vTli_F_v3IUWIAjXVMjQtIOmTdYbyzXkD1GJyGZilnBfXd769WnaioiZSRBXtSYS-qG31uZvlcVCYR9/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vSR8YZ8ZgYoXd0L20729PODOHSoRKYqZ1z4oBMOsXMalwi5PcX93LNke1D7uBSKvmvM3ph-H9TsmPS0/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vTgPFahPjeZhVbGDqlZ2SDlYK4wIg292uLaPmW697uvvfKbppa3ELVcjBxhGehI8VL-o4utbrx3ST4N/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vTnVrp2rUDN5PmqgCTFTEXRpwfowS-N2kF-yqzaacLudCvPnAVVwsf854dHHcpc_FNS-QqjmJofDTGt/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vTvpTn71kXj9_cJJoRlBB-wN8BAuyBLx7P5t7ErGwXG-eKHmLv9HZcSiCGVnc5ioa8NxwNcs9Q3BJ6l/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vQjR18Zt8N77lOAMUE-KScrkP5-gtrEZZC1DBDueYCY6z3TVVHRcuO7WLcRFKysQbw3hShn82Uq9G69/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vRisulbdffstYDRB--w4W4VD7ia1uDLs9eVcCaSvffJvFwu3HSY-7UpXfTEtSWtb4M9HHGtAIh3SrBS/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vRHwwNXYS_iCgtGMgi3OPw0m5D7ftvo5YQbt7ZwEMt3AYLObuwXbWxQLbjptitK7LaujvaLTrgoQ5jJ/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vR_Oj6iLOALi7IM5oTf7ph33HQ3Be-FvSIIcV5GP88WU52VXkza0WwswtUgywo68EYwdVaLTzZjkYKZ/embed?start=false&loop=false&delayms=60000',
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
        <Trans>Stakeholder Consultation Process</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Introduction</Trans>
      </h2>
      <p>
        <Trans>description-intro-2-stakeholder-consultation</Trans>
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
