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
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vRsFpiKsSdfN8vGuohB80P6mlvasWl1CRWMdSH0VjrDlXtFbEUXzs41f9U3E5b1npQ7baZMlZUyGl2u/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vTOiudqqAlPb1jtHReAFkz7DVpWoieX8EsPXeN0zD17L2AKVTKwa3EXd5qUYfuAUrqrMu_rzBj5rzC8/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vS59KK-gdfxNWp8WlMcBA2_Lw-6J-9mtsuBmWDNuTLCaVqWzZsX1vpjw9MtkqmG86ovxmysrbj3Jki0/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vQNmAjhd4KRLk67jEgpuifBe13AiBnlGr8Uics5iLcXEJHhBVk8fmeKcIho4cAH9anZvn-VjFrtfzNI/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vRb3glzOjzLhPAvNr7AGquJiWEUVyCmQcFjYz04vIC-52H_C_8HOoaPKizaf9ptNo-AriOv2CJR1sUH/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vTJ2OXorsvO440oxDbpu5pGFz6jRX4rBjEEuoJZUAddb-S5-et4k14mtPsD7fPmdnTDBorLLcMaLry9/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vTTGXU7JWOn-HbXpfuix08Z8mg_iMpWPdV0f50yb-WSwE9UKWmRieUjiPcx28lnQJq1gPyIUqct34op/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vQlkJXxR2qPv0ma1ET_pFPTv1lmi8eGsO4OU2bHXfout3Ap4vrtEHCj0i2dZX1CulP2QFN-qPZ3aZhf/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vSvGEaXCGYfTtrR_JVlsFJIt3a8K9z4BI14YAuIGPW3Tuxrjw1HWB5Aa08PQHMWamY5Oy4259-GKOE3/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vSvGEaXCGYfTtrR_JVlsFJIt3a8K9z4BI14YAuIGPW3Tuxrjw1HWB5Aa08PQHMWamY5Oy4259-GKOE3/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vQmvADA2JcF61KbI5V-4eORfeEI4RF1kbvwa5szN5O_o6x514S1F-RY2skbT4lAxD9y212nBLisvfCX/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vStr2chhiZDyoV2fDjKOxYJr-TPntY5RZjlme9fKMncOivGEN_F7hqtYOG94gQ8keUHY6ZWZudJodkP/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vSnJayUFWofycYrbEyhv6tExygRfNbbbMvrOI6x5teDwPvcl3cAJeLHiM4bgixiKHxAxhVsUyoncWtL/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vQDl2mO0_dKNHa3rpPiCh_-WSQVoZXHlf8x-mefbTPcCXFe8NAlrfkzAnA3WjYfayP8MQDEI6Oir0qV/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vRHwwNXYS_iCgtGMgi3OPw0m5D7ftvo5YQbt7ZwEMt3AYLObuwXbWxQLbjptitK7LaujvaLTrgoQ5jJ/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vR_Oj6iLOALi7IM5oTf7ph33HQ3Be-FvSIIcV5GP88WU52VXkza0WwswtUgywo68EYwdVaLTzZjkYKZ/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vT0CQjStCOLbCwyj3ysZGD5WWLYhT-ZdrV-cVobvJlWREPhnIzYGdOjX-2w7LU_51WlnchyQ9eSlG5I/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vTUPL_HsOAIWewqPdnS8NrlUqj78bjJyYEThTl0UegI9qZZNIjsQDYhxHFdJ2OZLfO2pVA80__URo65/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vSzny_neiMpQ5agsAtCR6vnhe1IkgaHTSSVD8M2IdxC56k2hcYG7WO2Q9LIVN3ki0NfW7juRhE_waTq/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vQN3fpr0WnkmNeVfV5jLt-mAqkdAyGAA7nZEmCmC_-JdwrVdO3erZMo2hmN7w0b0PcnwXiRcWF-jfh5/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vTztRE7NlgBBAqViu2WRPR8y3YvQf2YUrC3Rl-EVViRkWO-aEQezEmWyVgljM-9myE1t8DS8syb9osv/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vQitnhM3Wh1dmZqSLkBxfEhtPn1tuiGHYHgamzrJdRx8Q-Iw_QqXuhd2ozyFTJ7xtT-Cz-GVO18Up_C/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vQlCNMLSKjLgf9axC_Sj03mrvp2lGtERe4mRfV5Ig8yK5BR5WJs5OWtAvPk4PdhsYQqE7tLkwJbjaLD/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vRdyk6RJS_2WGUif6gsT4YMHqbgOp64YZS_JLhmMrE9d2-6v5sspSFfmqRI4nhYTlHUWCj541jSORLC/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vTYVUiqZUjyarEBCcNmaJQdir1UI33xmKEcruAOnbWzjDj61aNSu4thdkXQ9tDkEYOwnK3ys_i-OWxn/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vTJvx__cDnyKh0IC77xgmSBoLd2jhjZNdXkYHrAZD7PQKyDQVEB3UKP8eQVoAY7hFOpPHcWRaDNUKj3/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vSGcksR4K7UGjnthvhDRms_-tBxVoXH3bg-wXhyky1T4d3fj_bl8CxD6-m5gX31F_RFBKC0EQ0duF-p/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vQ_0eevcNgHzGiP608XublWPqPBfA9v1VJVFWZ4n5FjxCU7pxggUzWPdQH0iuUJyPeqCrdVcIa2TO_m/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vRrZWkh2r3tjso3jjkg7FTyn5EfT1-p3RUMk3Q5r4EwBaZQUdQXtQ0ObDW5aTvv9QtK-iU65EyoRvnA/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vROkvdeSktuHGzibGwNB2KkMSo-sMs-FHVzWZEcSx1164UVb378hIfXFjIoJEjI1TAQbXNDVa5_jFAx/embed?start=false&loop=false&delayms=60000',
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
