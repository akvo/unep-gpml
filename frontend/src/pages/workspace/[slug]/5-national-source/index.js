import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'

const slides = {
  en: {
    'south-africa':
      'https://docs.google.com/presentation/d/1qmK9r4PWaz95v38dxyGaRYGFlf91geQrV4XK3oMaAMw/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1Uml7deWkk5ae27-0amPSrO2sIv8fhwJIgZrTMF3rfL4/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/1m2EExmmDsmQdn9iDOS2AZxYgvG4WnKcG6hxyctcM3vk/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1EdNo1lccTkJJs1Rt_7VOGSlUQDf7367R6DAycluEQUE/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/19jKIg7VPWrKb30WEfDMYyQVEMXW3px2fQsNqe6XsFpA/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1QOwkFVa18_UcbPzV5oVTpTVGqgjNAaP8jVZCaq78hIw/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/1pPZP0VX6BvUAMh14dTPXRkpRVPrXEWczFTiOJdD6BcU/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1Y8RL5_e1iezAtnhMPFkMCQ8k2273rN_9-3jyhIziUi8/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1wjZ6bot3MISdQQaCB9UNRgwAgP9U3wxF790AClLDocg/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1eup1DSeN-LRgdE8XHn1GpTiFtKjedHh6B-GBckJHqcI/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/1bqJK-PvpQqOXqBq_YqdKQTdED1xhn1E5Pi_d4qwGE_M/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1c3ZSNo3twbKOKDz_LXcFAKq4qXodZQ1JRVYbAn8I-lM/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/1FGzfbUmmn-VoyWla_t59Q8W-GT0N2zUBF6Ue072tQ50/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1kQdA9-dzJKVKc5nK8FUgnYF1G0pL8szRy3Mp3HlC3GU/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/1hjiPal1SNYpKoNaTQZfut29BYI6RI8t7NcMG0jaXKGc/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1RET3_4xni0Uqb_vKOt_OurooroaFRHdw8f4PPftFe28/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/1E22cTkfo0l4HerJbG9c9XEkpsGq3PLE0AY-z1H_bAlI/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1CeeXIBL6TFLsFdNi5iAwd3Mpg1CuKAq-lscaABzPq0k/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1akYG0Qu8oEFyBxeVKIQ8cYYdLkm0Ur1y9dL9jzPHCiE/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1M5Q7Rbh6jxPgh9KGQBDipuhFoNo9NzMdlbZ9_bBqBqc/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1TvfebSuxjLf73k-b1dqDMPE2KQ3lfzjSPzX8gI-o2Io/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1z3E5N3LbvGIbZnnelA7l0-U7AYCMFaKk9J9nOLmshUA/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1mdLrkmug7eLqheqkY8zcEGFO75sGIpBcWm5h5KJ0-jQ/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1Hkm4IYmY9Eu51JhuoqR2Em4sgyz52rKDaROfGvfTcuQ/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/192NdckhuSDIv2J23-n9M17XgMS04YukMWlPQRSdOsHc/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/1GDNqtsCbYWMf2y3LDsbQRuQiia5pp5AgMGi-QgP6ScY/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/1n6Lau8cD8vlS-17MVo3OgrCnzOTls68u-O8CZUo0gDE/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/1i5njxcjY-4GaMal9Wp-H-fBF1fGCeAQ7momhWi5Curw/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1V3TS0zyqHzz7964OoidvcywUpTPC3ZDjFt4axyT3t4s/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/1S7dX_OlvEoaKb-T7hmflIg_d74Xm-viAQsSAB0ht8vg/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1WZbgXLYKe9-QtSVZoXgKXkI5FM04s40WO8fGI4Nqa9c/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/1T49sGQrgzJ8WXQGBBKFDDsxZGXOw3O9D3BsRD_FNpUw/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/1_gOw4O8odQ3bjz7mgSGHgE5cLpHNagNiS3_rIyxTEhc/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1mtl2qpuEgi1GFKrZH1PnYPqylIJ7saIySJAi8973tcE/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1Y4Oq9rQM9MTrT51w5o7dbYk007dnpViVfUV8VxlgObM/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1jXTVy4a5fahPQwnCl5vh0XAexICldXLnJn06lGhWIuo/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/16WMxVdrbYVoVXn1TnrLfryw1_EzJG7JZJcxdNsz-bgw/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/19S-QaI1hnR0KyoPSL6ZAAGpaPajinJ2MsBBevZcXAg4/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1DnBGotNKCCLwRiamAQpk3cTnHY_gjqp6n4FW2CPacC8/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/15KsnIsb7XfY95dxEdHndw1c4Gmhyf7DsDzde00AYP_U/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/17kKOzP3WOFj4kk3Kho2Z4d6YqhofG03nMgvEb9ZGGkM/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/1E22cTkfo0l4HerJbG9c9XEkpsGq3PLE0AY-z1H_bAlI/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/1hxwopKvtucSh1aLbxvpz8dEEdqFH7S7hS_6iiFoLBHU/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/1o1IlW78nIBixlKSspwZ5lKl0DTnbiogj-lX1PwLMoK0/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1CJVy1UmRwUIDdLwXCM3orp0KU93HxxzaI6WrjqoFS_8/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/1BcDZEl5Lzi6ezPRRYS8O7f8i0nccoLvW--s5XG_Br10/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/13IfgL4Osi3n03Qfb_1-zksTN2vWrut6fqkEpCUsDYZo/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/1QwpSJ7GMEiS03PgzWsLs7GdERhbCtS4ISdMOtvbGJMw/embed?start=false&loop=false&delayms=60000',
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
        <Trans>National Source Inventory Report</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Introduction</Trans>
      </h2>
      <p>
        <Trans>description-intro-5-national-source</Trans>
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
