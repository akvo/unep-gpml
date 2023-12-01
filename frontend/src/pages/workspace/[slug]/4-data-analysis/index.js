import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'

const slides = {
  en: {
    'south-africa':
      'https://docs.google.com/presentation/d/1QLIzl5tuNAMWgrsB7h-udHFNYIdZA8bkdQQW_xUZ_1M/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1Gijf1Pyi5A3TVZMkfpMvHuZE6JVd5zgEruWEJWJFYUY/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/1G98WrDgr_xfmVZ20yOKrFMFimbjgVyHNbVR0PCUGBLU/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1rKLdpyYSIY6wdyYe_CtckcXnHM0I7xX1vmk1VDz-8-g/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/1A5yNz_12MHUlT0-A77pXCk_emD6VqJEeZpCiZkOx_ZE/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1svNMcbQxiPSPscTiIALfVKI849plCUfOer_bdFst69w/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/1vyVuM28-W2gAXC23d8DflJ8uHzsnUyhncEn28eM7ekw/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1eNeXJOve0CzVf92fxKnx90V7p6E0REoG-ixZ2QQmGTI/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1hldalg6M6yOsUv78CA0eEqiKnT0na9YpI-u2epaBkoI/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1GQ4qkbWelCzDiqBUl1iRwM2iNjP3nn-hH1gLmkVWt44/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/1YlZ5hcDURX5O0JYR3xiM7gBTVya9H7ITI5QJ-ukrQ5g/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1VUpgiTVKRsvV85dG2B1h4D3IfVaqZxy7esHPky3lWiE/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/1hOQz7eYQu9TbnRL7iFdux50eCtuxtPAnOzMpeUJioT4/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1ZvEtzYV8QfXU4F2WL7M_5VdffeNF324FL8qGUMZUVVE/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/1JFvE7XW_FNZC0DIgThCniDK88qfZyrqhXzH4gDl69G8/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1Ln5Pfkhz1m7t9j3QA_KMBQJqYJOe0Nd-c2qByB7N1vQ/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/1dr71O0b5bQQxea6SFFoALLXcYEhapVGoll2ZzC0Fk7k/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1jNcIJSj_QCBC-GoMJPR9nqBXWdr1K9m_CVsrTUf4ChU/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1rY1A1KJm4XpH4yDcmV02bQVAarxhtMGbddYZaRncv8I/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1YZp6IO9WuTLh3s9sVhOkDZeEAYGEgyNcuDD7ypLlwFM/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1oUBoMrvScEhTqDcAyNDXV84BE9xgTPbvPhVZzZZB2Vg/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1BORQfaAxd7Y7ghMj7qH0fvgZQzOpJCZ1TH_LnbS-tmk/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/18uRJTBr9486AqciCplBvBDLYd-OR4iaFSyBWEPz5s6g/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1tIh3veXIG5AFqHS7YHfgzzmVr9FFPSj1QqCj6Qq-GU8/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/1VtnDXWWqMLnGmgf2RXv4JYqCsrKbzPtXo1k1Id0H6Uw/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/1guX9WVnQ0XYF51mhWf4v_LAHJeKvBFadjC7uljspqf8/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/1guX9WVnQ0XYF51mhWf4v_LAHJeKvBFadjC7uljspqf8/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/17cItIYrfK5q3R8tv2xWpm1sHArpQAhYvSsudNQLeYgA/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1Ok4Y6LMucHInuNucqnEPONGBP0yBsjW2nCznWj9h3kY/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/1GaUJhme5ZX6nuaG6L4PvizfXBuhvgqtWsabYebZeFLA/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1NcRKSNPFcOYsVsvELMo-MJYHBniXHtTN4iPhWJKKyp8/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/17QAzHXhpwhxBl0nDEHegdwaMxXVG7mbCv3b2ltzeYXY/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/1KPgLzwTPv92g6nBO6X32z-5IjWZRlpG5i5TteQqDXsc/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1KqbLXBmxP8ys4DpVF4T740EepJZ3lIuPkCcXuMiH9HA/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1FDEzTo7fHCqgKiXzkNL1yYtUIST_Bh-Smr1ot_19j5M/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1_OuvGj8JU5zQOxJIAV-Pg-peMTZaHEErTaP_FN5ye0s/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1nfezm8h-Vaj2alRAFunQeP2by2gcYN9rgG2xpoqvLC8/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1BORQfaAxd7Y7ghMj7qH0fvgZQzOpJCZ1TH_LnbS-tmk/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/18uRJTBr9486AqciCplBvBDLYd-OR4iaFSyBWEPz5s6g/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/15J2xVl-vFYtRVPCjqPWrczAptjkAR3enRTIZmYshiiY/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/1tIh3veXIG5AFqHS7YHfgzzmVr9FFPSj1QqCj6Qq-GU8/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/1TwBLMVA5RdC5WAGdA6D6JOh7FF3VAzPBag8kPsx71jU/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/1KPqoLrKhkYG4ITMsAc2tXxeOHquBLRocbSMQ_ZBur6c/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/1w2_G07cehAHdeiygLWW7ClNq3nSIfzaP4cks8hE_iFU/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/14ajHUa91YI24nnTm-Kdm2IDV5lvtYww4rFGkqrX18ck/embed?start=false&loop=false&delayms=60000',
    'trinidad-&-tobago':
      'https://docs.google.com/presentation/d/1gCtB71tN930uyNL4fQHWc4xYdz7v7JM618LCt1tF7lU/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1s9752TZZBU6OmcMWRjIjBOHMxElZ1_u8aQ3x7Q6-rgY/embed?start=false&loop=false&delayms=60000',
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
        <Trans>Data Analysis</Trans>
      </h4>
      <h2 className="h-xxl w-bold">
        <Trans>Introduction</Trans>
      </h2>
      <p>
        <Trans>description-intro-4-data-analysis</Trans>
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
