import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'

const slides = {
  en: {
    'south-africa':
      'https://docs.google.com/presentation/d/1C1c4902Y4_fD2SP5oLqMtyfkiP_CHas-fcg1PKTAeZ0/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1E8DxX4VdG_JZqYgrb401JoIivAMF5MqnAZqYCULnanc/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/1IpAWe2sP7bcSYBg3qRb8thuHCOOfhJNsYS9QQZesHZo/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1Kvl3Slm3waVStMUmrrpOZbcMV6S9fGTmCVjecGMi9Zw/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/1cpfRdWdDjI34HpUsp2vWrxmIdg3HT6rjEAzq43-80H4/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1x2XIOuTjEt0C7BvaZVWTLx_yANNmZeAROLGWyq_iEeg/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/10yy4b6irYTP3pQgrKlA4pv09Njw42ZpGsTyr68pcbaM/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1tZ_36xopV1_aSuQ2V-LW16RYWlsJfzsTPIlE9L5F5Ew/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1zZZuMJVB4JTXZW3YcjuOKCcFU2vNodz95havutiAivA/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1eQpcG20lgy_I8nGRwpK07900DATYKyH4fgTzvZAfpJc/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/1ICypzG4YjcDFLJNgGQ6Ml0lVbijHxlLA-C8q4HJgW5I/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1c3CuvfVI8-vGEfk95ni90BpKUFdA9ZMTyw14tSVcL74/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/1OrlbjSFkk1lwJcRBP_75kyg_3apxVCUchOlHP-FKIAw/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1iEi-xbK6uipBSQXs4T_ZhWWhD6DjG2Fxzg-gUSZLTE4/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/1ZvEtzYV8QfXU4F2WL7M_5VdffeNF324FL8qGUMZUVVE/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1fPZ5jyiR8dWv_BpbT-SEL9te31L1yvjxvm-tNuOjv9g/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/1jTz1Hu_EBNMpvuYTM1PZQjXMLU9bU1-gCIS2K0gz3s4/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1kbQo3NhpFgrcWxOtwP9E87yJQ2BuVTlm47LJUHRxURs/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1GDyRNUKFKuQVKvkyaL7pLzFp0vnXF9H0IZYkZIJv9GI/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1zgn0Vv0wVLOtpvVHoFGuRF8h1K2Evy6VBtw-5qgsejc/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1oUBoMrvScEhTqDcAyNDXV84BE9xgTPbvPhVZzZZB2Vg/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1E9YIVRCcT4BNUkA9aKPZs8aHogBM7rc5XvoHGQSMjBA/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/19HYnDXB3jaDzUeolhz-YLPwTqXMc2XU3YlItqf72Eyk/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1d-wMqlqYRw9yigOu83o05qaJgti5EyT4GymysFDEMJE/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/1yNPzzs3fLF2IDuNuCNjOOAO-kZOoGDMT2ZEMSfhU_Yc/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/1BMMq8XDKSS82NKroM5UtYqDgTSpdS9RKSKe-tvJR4XI/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/12raLPbM0IPju9D91Zbr-0dqTmTZ5HHCE1ijyFmPoNHA/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/1_bp7nHiryuliy8E6PChQYpuzK2S5gzVmLfu4-i2LR6o/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1siGDDM2haJzWZrAfaxiVV-JRCQuLAZh9C0kW647Utzc/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/1F6sp0U7ZnNAPpQAiu_Lid6jVAoUEdpGe5X5tuTabDNY/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1-DY1E__8TqznNEkRMfucvgEkBF8QuDC7TI8BJYXrG7Y/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/17QAzHXhpwhxBl0nDEHegdwaMxXVG7mbCv3b2ltzeYXY/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/1JnCvBNUxkcNFYgXsqsWbZ2cSmzFI2CBKxZLiZdBum0I/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1QsF7TkS4yKAaEgCr4v-NDpQbVVqTr6j-_FWVlZ1C2So/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1FDEzTo7fHCqgKiXzkNL1yYtUIST_Bh-Smr1ot_19j5M/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1MqU2HXl1I3JdpdRQYlDfwrIvO7p92iHB-UU35TndW20/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1nfezm8h-Vaj2alRAFunQeP2by2gcYN9rgG2xpoqvLC8/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1SRNRtnMNoPMrpDTL9C5YkvzW7-WZ59AHQ4ra_wm6ZSM/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1pwiwBgYCDa0NLqoGUvilSVsqi3tzyVbCTjgcaPVWg3I/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1oRkha7E8yhkJxTbjlp4njVkcBBIIwfq-q71NMI90epw/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/1syFPxQxqdK0w5h4mufZTAd1nWywcjZEaOHCYrz99R4Q/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/1o3sNNs0h-_9PAEbsq6NksM4c7ORuSKyooH7toR8PmEM/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/1b70GfAe5KpJX6GnoD6n-EpurBNPxlIHfZWqnc6lruRI/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/1dTy3dy-RA9QYJNYxszaMyT_qYiYw7mGl1yavT4aes60/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1fDfs-vYk3CclpQXvxEfzEY9wgLvYbSp-NEloTYb5Qzc/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/1DOYjA3QkBbNX86ZezVBpqiWV6HCLnFAhzzW8yMK1DWA/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1fbsJvH53J6YHhfWvBnonKEekRQzKXFz71Ubn5913f4c/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/19oK7n6sHz2rAO4jSvWveYtCQ1AmMAHkAj01JPv2nwc8/embed?start=false&loop=false&delayms=60000',
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
        <Trans>Legislation & Policy Review Report</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Introduction</Trans>
      </h2>
      <p>
        <Trans>description-intro-3-legislation-policy</Trans>
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
