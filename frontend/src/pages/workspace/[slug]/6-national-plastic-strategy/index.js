import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'

const slides = {
  en: {
    'south-africa':
      'https://docs.google.com/presentation/d/1WmwNv_eh5p_-QxVIgdWX1gzHBnyBojVeK32HDUAj2DE/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1_SYjBq_2D_9OmJVceP7z2AX6ZSvq-X1Sb0piHNDcuMU/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/16pZFQq5ao9rXw-E-KrLjtxMQYkk5FZc3MrbZyZo0x6k/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1UMvU_6LU_YI-QTdfFstRTl1H1S3_3lugDPoA7G_fuHI/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/1WYiT3u2QLfWVZS518C9UleJHuHZhX4q1fEmExH4mChQ/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1Vn_F3FpQmbRSJxePKLhkJqY9Dwv7H39g2oYwkAiwsSY/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/1175u7vjzScZZkHNn5cj4CV7Mc4DleJP4yIJBBGgpniE/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1Cag-t7fwx1uUuf0ayEtKzoNaErq8b96JSyu_3wLSHtw/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1Ef-pMEYDFXpqO-jtDITIXGm34ywpv6JFO_kn85kNxJc/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1iOyiotW1IoGzZ9nQBlOtVEE-G0NhNPfUVPGoVotkfdQ/embed?start=false&loop=false&delayms=60000',
    'trinidad-and-tobago':
      'https://docs.google.com/presentation/d/18Lgq4XUsRULRdmRgVhvZl5KPyNKO3V-KFBtbLBaq2pw/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1b24FCounDz-xI1N4Pjcsr4jr05E9b-vN6SbuSYtdDjs/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/1FV8Nmw9tZSHd3UYrNPcqWF21bDmo8co81y9-xShd-0s/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1PgQgpSM4_71-k02Nl4GmNF31kgOfepEzqoi3sVeNNlU/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/1L6h-1YnErb6ghP-xEVkViEPSdSynDr5aD5ZTGmxKQh0/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1Ao3F0mRpJIAkHc2cLD9HIFZ5QHK0vPzLPsl9pbMAMqk/embed?start=false&loop=false&delayms=60000',
    jamaica:
      'https://docs.google.com/presentation/d/1FZhHoclXPLdYHxuZKnOcCluNbFNw41DUn3x2Xci-VJg/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/1UzZ4lKaaHVPiHgH4yOgzGVOrvGyygLvu8weayVxJsSE/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1DrsCbGRCRvx-tBQOvZlMlBsn6cJxQhFhULx7ZMYa2ZQ/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1YRiBUoB2D5L5FKK2LYLb_3vM1i4qB2EgseesenVNuE8/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/15An48xWg9JxgQb-oPLfE0P-F0_3mYwBpMa81WhXQ5Bk/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1qkJi6MW5WBf5iUDmtcj0wtWNrpyWLwilIj6btIwfOAc/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/13nYqaCAdnvwN7G1Vve3mCSfFTshziJrOxFCY7P7cPFs/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1TB6lZw4RfeFNBG4MV20lYXA7JvHs_12LavNltgIarDs/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1I_DOT3PfhUkGQguu1wqF0mDGjcEkKGB_tJ5ZR45q87Y/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/1klVH4cpTLOz68E5gZksHbF-ohnBLEobE8EVPoz1CNAM/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/1IZXWgCVsuusInsYH07OABt8iHA7DQTUoJXm9v-/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/1WGkfWktVzejIDsJ0WcBO_T4v1PeGxvnx3ktMNUClVo4/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/1BFT4vjPysB-TdmHPxxaoDZ4qhT3wwfwlIrowVhTbBFg/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1Q4rSm4xguMc_qQdRXeAKza611s2O6z2ROCJAVvA1n30/embed?start=false&loop=false&delayms=60000',
    'trinidad-and-tobago':
      'https://docs.google.com/presentation/d/1m-Rjfl9f0M2cHTKiv2MnkUN8KZS14osMXOccbkr5sac/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1lucY98UD957MXWHGXle4wkEX0yvOrewLUnQgVDEwcVY/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/1RcmixBoPTFIgBHMSR6lomKMFCZQAAOlWpZfzRdkLcEQ/embed?start=false&loop=false&delayms=60000',
    jamaica:
      'https://docs.google.com/presentation/d/1VLVGtIeIVFBC3tSgX0gkTl_nhzgBlfjoBEiCkrlsaHY/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/1oMYGhIHO6iGcCVgQNcM9-TP8uc-LOInUe2d--9DwB78/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/11KG5xFvnxAzxRv8lBsF3R4ZeHRbvdCCuHYjmwnoAHIw/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/13TK9hsZiEysSInDqCaF3ylcVUywd8hon6E0oB7W9vhc/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1NpMiVBsMN0adJSHJJ83lMeOUb0pBIKm68JZqBFqy0wI/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/127979AJpDklJKJhNVnIuEILfex2pY6xTu-Ejm7icr_Q/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1_TebR7j1Z9SAF9s-vajddknkNbvAVY_k3AbwvWARzrs/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1MfuebPxxWmKyU2Wcnhe2I0etEHmef6vTRXahL9acEI0/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1BkD5v-iPcYjgHEW3ZrZsnCMs3GG32YnNV1uk_jkTV0k/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/102RnsZutU38xxaxkQQypEw7svmUU7kKA29T91GQfdAA/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/1moiiGmIKuAYgd3PZRsyV4cu-YDyPEgQXrHrb5yD9fu8/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/1LJbbW_W4hY0OVNs1HdW_Dzg4CQ181WPIvGaP_dGKO6Q/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/135SDrHh1ngmFNVHmRP7JMAAl4dnka3knfFax4yLl5OA/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1n8tUfz0hHLTLq690ix2siXfzAYZXId4u_by0r0hBmow/embed?start=false&loop=false&delayms=60000',
    'trinidad-and-tobago':
      'https://docs.google.com/presentation/d/1i2rpy9vYhuMNLnuhVqAPdyyKU058Z678q3sZTphcKbA/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1VtYLvKeRmMYpVxF5urKYBs2Njg2_ljeqtjEDyXhy2RY/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/14EnATU9J2vgOFqgsgsRAbeqI9v7ydWOIkTIrCY0b7V8/embed?start=false&loop=false&delayms=60000',
    jamaica:
      'https://docs.google.com/presentation/d/1ynfNAdufTONyV__OJ9JT3cLSnlWUvX8SIKT1OEksuXk/embed?start=false&loop=false&delayms=60000',
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
        <Trans>National Plastic Strategy</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Introduction</Trans>
      </h2>
      <p>
        <Trans>description-intro-6-national-plastic-strategy</Trans>
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
