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
    'trinidad-&-tobago':
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
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vRcE57eStO9ByLqaA5-gC6R1YEbeabmeL6QOKI5_mokuLiEEAiHEIJJz3QNv3Pmt_-5xKj9ARcDNouW/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vTFC_CHUZzD3hLfMMWn6RcxTPTuWOHlynqJui6r6CfhS0LMbSuJhww06riAxtgyhR8lNmBeJ1r_JDeX/embed?start=false&loop=false&delayms=60000',
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
