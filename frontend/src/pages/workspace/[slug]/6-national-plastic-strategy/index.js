import { useRouter } from 'next/router'
import { PageLayout } from '..'

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
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vR5ydGUbxHDmh0Jz4H3z8qzAqv2oOSCx23CJk7sYHjmCzhU6CD8e4mlHih1i830wBItht9ayDjhBSKb/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vQzYwk2Pmc3AOdC6T9OOGq_UYK5mZXobOor8UcD9DO97x_-tKPQDWamE8tl9y4eC64hjOnn56szMBQe/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vQKGg1hUeUQlR838Vv2sLKuf1-UGmDp9koPpwEqZ9LvSUF-9bm8DWyBwx7tTepEnPQkNZDkNA1HWpk2/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vT9tm13MwhUjnHF6VtmXcHDZqQ3e-rYukhewD7eU_r4XAIp_0-t2Bp8H2zV4uqQMesNjqAMBk5cc1TH/embed?start=false&loop=false&delayms=60000',
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
      <h4 className="caps-heading-m">National Source Inventory Report</h4>
      <h2 className="h-xxl w-bold">Introduction</h2>
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

export default View
