import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'

const slides = {
  en: {
    'south-africa':
      'https://docs.google.com/presentation/d/1eGjqXFLOwOG2FygK3a3MgGWPKyjqdW3rvNqGcUJ8rnE/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1Kw3E-ZrXo0J5CW-PvTURoET-COZ8lOk6DV48QBYlr08/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/1ARlpR7LJ1yIl7EdDSmHY8CNUtWAcj4eq0FDBlNI4Vyk/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1LZrdsLxPSEHEVk3kXFFGViE2l89dlTQsUguNHhHV2gI/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/1y9ovxrdQndLolklMpk4ok_emMVxZ9o0WsqzymTaF9w4/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1g2ItBQes8CAcsPXYOFdOCH4Za9ZhfRjzrj9CrZxedF0/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/1e-iRIGg_MOJ6lQsb3tCftFZZ0thFzlthyrNcQz3C_-w/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1qMnzwxSObm00MbEfjePW268H5qpoD0aOQ8alhHAvuds/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1xei7p6P2OmJPCubvEgaoejqbwCaWzm3C9q2M4Td8Ef8/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1uBGIN4UxXbEHfF0qX9SqzUpBuXa7XOe4cw-4-ob73a4/embed?start=false&loop=false&delayms=60000',
    'trinidad-and-tobago':
      'https://docs.google.com/presentation/d/1p4Rd44xTZEsfYZNLVmM2LBO7_yXdh27B3iqpT5dSVi4/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1GcajG1OKmd2_k0VRZ_Gt2Yh9s9tjIR5rov1SLzFt9bY/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/183CdSth7_bJWPurgpxoIRjo5nWZ11Il8OID63oTxuCM/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1ZOnhdcja82klD7szGDd4ppa0n19S4PIDvwmOHDEqUYE/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/1Gd12Zk_3bG1hOg24eTJTRFhOAaBI8f2-o5bU5GvBlKk/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/14H-VGnV5S2A0DS8T1c2XK_6Ncg3tEQ6qjcGMFqprQHc/embed?start=false&loop=false&delayms=60000',
    'country-a':
      'https://docs.google.com/presentation/d/1QrksZ9EurhTLldyeluKQ2Bp-BPJQB8-tZqDgUXgkp9c/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/1kZbQKdxyAIgcg42uxUAyIb5kJNAwX2Q5KNDsf1qhouA/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/16f0c-Ghw8od1fbvAlvGZb_ys6CT0u8HO3PGMYNRr_ds/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1_ETnSSYOm9iEv4nsN2EqDxPJpFskc9ZPTc6NzlIBb-w/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1luFQta8O_jIwGTaxRw5OdLjEdMBNkw9ZkTg17eNzfpY/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1KBtFqc5x-25ZzSmwgmj-zrIbj0ZJl5ts6GxKKqvhRg0/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1bhqeP_lzISqOYEyXCfwKrdfd_kkC1k8yLPhdB4QRGdY/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1tn-s9brgRb8S49z2_dwKxDitHdYQ9v1FiOBMooEzSGI/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1YRzoDhFz8G5mLMoeK_GL9TzD7kytju75k6vFw2ZkXUA/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/13jRalmyauNkMHLgYl_xbDiWU16QewxtcovCMNpV5qTM/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/1iSI9J1b0X1VUnDNFEbutPzyLERJmwgkyneF8ezwS6Js/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'docs.google.com/presentation/d/1jYvmRrFa8tdF6IVdKSUutvZ0PFiDtS_Dbp1Z4ixjdmQ/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/1T_DDfxQiN6XaZuKIXqJYHoKAqBYptSg87Jkg162HrEw/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1ePUTsz_QhyqBBderJn81uE9s1cXV7-mvDcdT9wIsvEg/embed?start=false&loop=false&delayms=60000',
    'trinidad-and-tobago':
      'https://docs.google.com/presentation/d/1uO2Z-KyDRiXHfJ1j6qH9I604lf0SKbA3P1DMOl_5ZJQ/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1OvK4C0hOATBf59gnutsR3wB72sOrGB6iraywNuRhxWY/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/1jbq9t2G0_HBq_aRxrS7ic4jTBjngWQZRWqaKo7C0A08/embed?start=false&loop=false&delayms=60000',
    'country-a':
      'https://docs.google.com/presentation/d/1VVQ3NyM9kaBdz7VoD7MXUOiz41DdBeuQ9tqQfZR170E/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/1Hrg9KIL_rZvYHoVEVJgmeK2nZS-1qIJiOGLB41n2fgI/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1d5NwaYF2NX3r3mv27BBUfswp1S8GZ3smffRIpCx1AtI/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1SIBzowzJSZzLKMZL3XdkpuY2ByIYbNk3OHeViBTQH60/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1XIo97EscpP_pBvAEMD60cynE1kzsKeZ1zayZSEmbwfo/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1kQ6lnxTUe1hVaeA2SMrJoJbSGol93X9hupaew0sko1E/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1Z4hwvXDqaNA8jDxNw19_yib1z7z9QD8aO6NLkVyvjjk/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1Kx7nG5VTm3eCjvD84Kebz9CkE5G4WXR7FFkGp8yZudw/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1U4G5RGKeh83zUgtbDljK57ACRXyyBpfCB_x4GVp3JNo/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/1yIaHw6-AoShq0KZEdlHUBlZWGXiPSHIowO9ZueINw94/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/1EqDBA-MJAhhP1iRI6oXZrpZl0-l7e2SqXF-xmpgwWfI/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/1YrsTU0Sgt2Tz59OT6Mu-wLJ2Q__raJq3gE070boejgY/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/1vFuO53R7SRerDv_Aa7_IPJo61ZGimZJakNx8IVNlk-E/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1HVciWM-OKiQ137Ye01OY_-zF7SaoVKPWwPE8MHl9go4/embed?start=false&loop=false&delayms=60000',
    'trinidad-and-tobago':
      'https://docs.google.com/presentation/d/1zBSPRpzOkpVgzgzBU2LF-MCRZcWQ7RMlovedk31mWcE/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1kPKHCsFZv-nrIBG8gYMKMahq4-P3vTk1B7OAOPEAJDw/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/1byDI_krSoxSenvdpKFQajq5MriexwJ4CxX82UA3CSrE/embed?start=false&loop=false&delayms=60000',
    'country-a':
      'https://docs.google.com/presentation/d/1YqIdGncEzeo6E8VSXF0D0hW4eA9jgWcSypoq3LGG8n0/embed?start=false&loop=false&delayms=60000',
  },
}

const View = () => {
  const router = useRouter()
  const country = router.query.slug?.replace('plastic-strategy-', '')
  const slideURL = slides[router.locale].hasOwnProperty(country)
    ? slides[router.locale][country]
    : slides.en[country]

  const match = slideURL.match(/\/d\/(.+?)\//)
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
      <a
        href={`https://docs.google.com/presentation/d/${match[1]}/export/pptx`}
        target="_blank"
      >
        <Button size="small" type="link">
          Download
        </Button>
      </a>
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
