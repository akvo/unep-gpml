import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'

const slides = {
  en: {
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vQSr2E1HdewWl5n5pjxFt6uUlv7H2LtNM3xVyGT1qfY7F-Ynt8eFlNOFWIupitgieBnlSxyDWBZz24F/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vSr5rVLWillhZy02dYsyNQxVUtXxrvdZD9p2QdjZcsMUWxmC7OdCLEuAtV8bgXeuPTEPF01K7yz4hyi/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vSbD83-2QeAl0Wqi8EaTFzIXKVa2sdbVVgkIrwQbBZQvAEQHUzxVuJF6zoyaxX7lphALiut3UJn99Yl/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vSu-83ziVe2ut9bnTxDDwF4r4xbrr2MfCIhVliFqC5HE9CPBpr9WE0vsbQgsnYs2QJ5_ZlEpP4A3Gdd/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vTlahcjHHa6Gj7k2RD5gsAZLLl3-mCGJuTb46RWi_Q7XjcIiaImHFvZ3vnW8vji7o-GTgwigoeuynm1/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vSp3GzrMrow25gnrWoxBAgtH3tFDgUp0AZCIvDu_aN6jOedUjxJSYziuAJlGGhWUc0rG1mtIXVbLpMg/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vRxNa-aWpwSe_kAz0My5F8gSxnwU62uMU081lsEypXP-CtdnEna0g67mesT71-rxxiuk1GgGQMdkDU0/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vTMZe1Gu-2CZT6a8vPJQe4f17O9bn6Tm3XyBtHcIX_NB_3t2Bmv3J-dfDkJl9OcX-HAKqpGhUaxaC2t/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vRFvYSuYvDP7E2AVugVSMnG4y_SrXfrXNmhvTqLuCVF8bzmFdQkdNQ33xcQQB19_AcmNjT3aIgLMY-4/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vRpq6Tv9xjObXI0VsgFUGLqZJXTxb-oIEQZ3sZuIITPqbaCUp0AxpaCdRyPHf65YCoV0H3U1Cm5qSoC/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vST4N26jY21ZhpwhSWnoTApexKCDZysJKFa1llgWB7dlKi7Fwq2L9RBQTc6wz2WRflm4H7veTKlD1H4/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vQRBlKM0aCiiKQkoXfCx0Z1dNoHM2w6p7vk0OQtZTrDhc1dJQmGLGOV3P6VMsAnmewFciCjolJj68LA/embed?start=false&loop=false&delayms=60000',
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
        <Trans>Data Analysis</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Introduction</Trans>
      </h2>
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
