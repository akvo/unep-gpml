import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'

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
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vQXyd8fC_EwEl2cvso5eA7DZJWqY-Vj-BMEMZ1NF_awK1OtGF15WOg6nj5x7gWhTyd-PaSoBr8VDATH/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vT9sKjUFNfk1Jme7xE2PTYjqDHTodE-mtz9XkcmLTbrOkTICsb8_5cDRMl92C7HMz2zK4MCgfdetYYU/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vSWyuLOo4yqQ7XPYIrdFXqXEYhc8uquRHHGSd0l-HRur1h6lvhNrqPcmrINbesYiK9I7lpN8Z8_nr2p/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vQae2j7aHrnboFbnDAkWdH8pH7MPppYbaCtyfyf7kqH7fk_88pirQPKMarw7R858liF7YNQ-Bu9527P/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vQVUHMLq3lCTZ2Ko1khSS6kZg3rUG6mt-o5cFnrwuO5SXoEiT8nbhzgmUS0GYdSIzmURU-WFJgIpF0B/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vSc6bVgSVpAUpemkYePev9JTNe12By0mY1ZA5YNbe50Gfu2RDMFAK4yPi8fvjv4-8jG0vfkqVoFc3BH/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vRX7ef9AW4gGpQbio21YRyq0sCnDKgQlc7n4olcbS2t9QavY2JOZ73ZyeGRBy9H7X9XVtFYY6u9vOu_/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vSJ_Y7RnOcCWZ8sahqCipmF45dxZ_ecuOrKEQADNaBABTfybFZLsD620WgF7Xx0po93CmBrE96HZf7e/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vRFvYSuYvDP7E2AVugVSMnG4y_SrXfrXNmhvTqLuCVF8bzmFdQkdNQ33xcQQB19_AcmNjT3aIgLMY-4/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vRpq6Tv9xjObXI0VsgFUGLqZJXTxb-oIEQZ3sZuIITPqbaCUp0AxpaCdRyPHf65YCoV0H3U1Cm5qSoC/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vS7RJ0CnVOlR66Hh7mH3NtoAu0niQ5WV93MsFjGTTFUZigdsI8Zkfln6gjZDqeL0g5ktVIRBupes1mN/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vREo_9TTainzdCoOQYgJbCa7dC8WNfITKze6aPZYwXCLEzzxD1ydYLucNgiIZlofValscICqBU9reVn/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vTfqo8zDFtU2DboAbgZsaY9z39u_V3pqFyUnfQeFLw0ohoQK5n8lXkP-wnalpptMHAFOmnJVdx1tArh/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vTgTaLMycuQ1XMrcRNxvIjtry6UWWnZLHvA6MCRkiga-h-KjhfJYBguEb5L8EnPvGJpoKEHsbu2vUI5/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vQ_Mggj7EUvd84EvSreuHTfiSg1NS0Psif8pXAGytbCQ9XpWwa6MUg_JGYAxLaB1koqLQXRXSX84Nj2/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vQu7NqM_lshgkAftfBmrllntAu8HOvJQA7sZE2oMIJmE4HOckTWmd6fFJBoc9OeRqjPLWfCfmD7CeYP/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vSS0B4ljqvoqEmwUs4o5qi18EzREBERFgxDaf-fOxxG9Wn2_pad4sO_6YHmtm2ts2yAJSRRuWJKEZuZ/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vST4N26jY21ZhpwhSWnoTApexKCDZysJKFa1llgWB7dlKi7Fwq2L9RBQTc6wz2WRflm4H7veTKlD1H4/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vRGOv27619N1dqSoePi7yNdvuBWu5IKC_Hbw8OU-kJx_D6MoRlJdmJox-xTklXtuLEG7wpEJ0CDoVJN/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vRXeAwBQ63p4JHJh2BPT-jNLL4PlbFQxljY7s-oQxzH9OUot6WT6jjP9O2Ul7XnOU3syd88Nc3b-vqj/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vSXpSCKA0zFLX_mbaqK60Eoaocjln4diZ-nynVkWfQ19XuvBa-9ii0NSKZHF5F6bIvyk4xqMtgm1Oer/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vRkPBr98xEbza1fLar0HOqPZ0gKOATMXOUPWiqXhHFOTqiNW-R_IlpjZJQHrOjtfNuk1WcSU7yLue-M/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vQZhfgMJ3K8MTPpt2XPcK73YXwZ12FnImmKyBopJu-LPM9VrEwNU9fWNRBK0zDPiZ2W9TVMfH8J0Skh/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vTF21bclOQWplY64APy8SgvOJy0e9zLMRNZQWyA5UZk-_LGLMWSKtJrfL7diUHhse0ae51Cq3tNohSS/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/e/2PACX-1vST4N26jY21ZhpwhSWnoTApexKCDZysJKFa1llgWB7dlKi7Fwq2L9RBQTc6wz2WRflm4H7veTKlD1H4/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/e/2PACX-1vQRBlKM0aCiiKQkoXfCx0Z1dNoHM2w6p7vk0OQtZTrDhc1dJQmGLGOV3P6VMsAnmewFciCjolJj68LA/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/e/2PACX-1vQInFHJ-lVFREE-mXU6vv0Tm9muW_bY15hhTxaeHrzR2D7Ol6kFe_2_OeoaDP2ALhI-huRBjpRygYaQ/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/e/2PACX-1vT9e5C6YVBEHvKBeD0A5fqVdfffyec3U2r4KVJohqd6calZ6LTKcn-5B3r2oe88xYJEpI20E__Eb5Il/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/e/2PACX-1vQlYGXZdDp7JAP02RVa7X2pTmy2Gqq4iHMN8N0-sXgDxIOqvWOL_BOFbl9toA8TdF8BG30cFEZoEIW3/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/e/2PACX-1vQlYGXZdDp7JAP02RVa7X2pTmy2Gqq4iHMN8N0-sXgDxIOqvWOL_BOFbl9toA8TdF8BG30cFEZoEIW3/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/e/2PACX-1vQ_Mggj7EUvd84EvSreuHTfiSg1NS0Psif8pXAGytbCQ9XpWwa6MUg_JGYAxLaB1koqLQXRXSX84Nj2/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/e/2PACX-1vQVLOhvmrqta82NikEzJJuzZfOgu8XTSn619buzx7gZW9RknGAYeKulf-DjFjTCzA5HkligIBgl_6PD/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/e/2PACX-1vSS0B4ljqvoqEmwUs4o5qi18EzREBERFgxDaf-fOxxG9Wn2_pad4sO_6YHmtm2ts2yAJSRRuWJKEZuZ/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/e/2PACX-1vQJFjTriUCDXa2pME9oVEMUiYn3Bu1nKNwH5WZNNWgOkyF2Gs_wJHOEJbkCyb7aAbxMne_U_vkgjoYk/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/e/2PACX-1vTDtCC0UREfL2TitN6jEncEsayI9mSsXJS8AiCdO4bCAQU1zY9snvqsc7FTpHsTRHfmd7XV9j9BcNAC/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/e/2PACX-1vTw3M3ohvHzPWUA0FlbmfGWGjlcFO1tLp2nyJ8ChXQXe0Dc08GVVil5G4YSCwJD0ShB4j30qJ4u7C6u/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/e/2PACX-1vTzgZbeqfzj-4wlKrCYCwf3aJjs340VyeqtoEMW1hB-wDqVXx0Lc2Fc_HzZF0UdWYqTr_pM0W_xr5YW/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/e/2PACX-1vRzFhBZiOPeESmzCRb-_IxTBV10uBanM1N-Pocn2iusijseS7tgnzDVpOpQx8amiI-rtrgXYiRcADU2/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/e/2PACX-1vTBfEAYuMVtOGPtryyGMilmLjFTDVvDyn7TD5JS396Uzr7ccUTo4FEITYr9d38RiOmCynsvw9tq9Hz5/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/e/2PACX-1vT8JrVzPDUWgptSE3N3NHsHTr1Q3rcm2Q_Yhcaxndqs1D3WQKU5dWN6i7zoEfZS1roqoUPEPjctRnVX/embed?start=false&loop=false&delayms=60000',
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
      <p>
        <Trans>description-intro-4-data-analysis</Trans>
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
