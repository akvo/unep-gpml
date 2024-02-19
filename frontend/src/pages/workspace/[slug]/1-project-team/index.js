import { useRouter } from 'next/router'
import { PageLayout } from '..'
import { Trans, t } from '@lingui/macro'
import { loadCatalog } from '../../../../translations/utils'
import Button from '../../../../components/button'

const slides = {
  en: {
    'south-africa':
      'https://docs.google.com/presentation/d/1-2HYkikbZkWJZYETo5i0YGRUWce97rfu-a9EfAX8xqU/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1RKnAYX8wSQRjvfaSxaBmJQKC-55ovUmD58eEVHJX9Lw/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/1tueu6WkIUsNH05DizTU_Rv5Oqj4N__wfzg6NocN-fW0/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/19LTTrVunEYxMriBn3W-odMgz0NipaGSF8qT25e0V7pI/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/1AJQmvIjoGU5a73lPUksqYayYqdO-socaQGmWaxidL1M/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/19CCN4t6pvg1Cr0iYlljpAl6ToOgm8Po2l_fHDuSvFBA/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/15OoBir4M_qLy9tQ890Bea7eHEXh6r4JGZCWds3aW_IQ/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1BtVAJcE7-LOEWvGt4w7_BRVKhi9Tsg83i3Lqg9Z-f8g/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1JMTN5L7UqfBxxVRM3eYUvhWtdoQKZDa9uDGqhn6OZx8/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1ry6P35P0TabKoqXIjKHk8FndXGZpvIScbAw8aJkkyJA/embed?start=false&loop=false&delayms=60000',
    'trinidad-and-tobago':
      'https://docs.google.com/presentation/d/13emat1QimpksOuwT700c_WXC6WzMp673LSN0efHbYz8/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/12ip7cBkp_Mp3fp10UMox9o3Y1Y7Dh9NedlgW09PVMf4/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/159PvFKWEn_QuVwlfeN_5g23knMpq6U1H3K_18nJfgPs/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1ROxyhKW4AV0DjWBrzFuHCTKUjPdiNe5FG5KOxLMWeTU/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/179ehHu5GjAT654FGodjXbsPsGDRyPQrEUjn4u3ra50c/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1TmjOpPlOQQZVwGkZBTftkkiM_uwAqXBY2LKsWhPrwXQ/embed?start=false&loop=false&delayms=60000',
    jamaica:
      'https://docs.google.com/presentation/d/1ABz6HmVJSsuP4PbkKiw5cimgV5qQIa6TrY8a74w3ls8/embed?start=false&loop=false&delayms=60000',
  },
  es: {
    peru:
      'https://docs.google.com/presentation/d/1olcflxdt8P0fMmW00lb_iFIX14kz-LF_SuC7mh4D9r4/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1YL7PuHZFWA5nyBnP0MiDYFL80srPzem8AjFMzed5gEA/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/17MC8_OahXygH1WiheNmmijbdP-vZnmSYdRsOIe2WR8U/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1GhTpfbe-3_sYmOJI8DghC3X5getTHk6WYBqn8tu7HpI/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1hwyrzBK7QQhv70OwLWUnrKwQt6zb4P8TQMfly5WdF9E/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/1rk3AUyc2QpVLiNXAG34B_HuL1JPTuwCAv5UoKoim_8Y/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1xFGpH1XJDmHHBWyxVVbQJyt-mTJqr9WDKo5kZ8PkYH0/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1_SBkyeSmFP7JpxuN3OV5oqMxjxoum7QjPw0OJSoBjxM/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/1yPcLPhXSQ4IgTVEKgS_ycj72_6W9QtNPiz8ULSRqUVA/embed?start=false&loop=false&delayms=60000',
    senegal:
      'https://docs.google.com/presentation/d/1QEAJjYaG8ZnCze1MahgTuxy_aJ4-ruW7zCA8D-6IC4s/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/1tmqdF4rj6hanTmtUvhB8rPGxRHbSdetJKrIUHpuo-ws/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/1z-jmgG-ub8QlPr7hJWRFdnYNnuH3cW9T2Ex4TdUtrlg/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1gbszNpQIFo8oUQneS5EksYf1bgH9jIBLMfZZNEelFBY/embed?start=false&loop=false&delayms=60000',
    'trinidad-and-tobago':
      'https://docs.google.com/presentation/d/1XexjJ2Lr6c24jOSDIjNwGqy5-_8RhXlFAnqP3vcbU94/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1HcfXhnowCj5SYi1TntF03otZ7KIIcG-TU30M7A0YNYs/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/1qrS4hYFnXjJ2AwYij3eod7oiY5Bx9msJv1qDw4XyDXQ/embed?start=false&loop=false&delayms=60000',
    jamaica:
      'https://docs.google.com/presentation/d/1GW897YD2HCV86aiRrVmodUqLRVFGj3yPHU7OnfAoN68/embed?start=false&loop=false&delayms=60000',
  },
  fr: {
    senegal:
      'https://docs.google.com/presentation/d/1vLkw5ws5dDlv_bgYpPD5IDvWbxdQWY8TW43f9vAu60o/embed?start=false&loop=false&delayms=60000',
    cambodia:
      'https://docs.google.com/presentation/d/1kD57af6Ol5meewpOzF3MFS7KUOSc7NQushFpmG3PoBU/embed?start=false&loop=false&delayms=60000',
    'cote-d-ivoire':
      'https://docs.google.com/presentation/d/1o9wnJoYk9p4TeIDvt1gqmwwIBFA9GvbfCmjPM52Dly0/embed?start=false&loop=false&delayms=60000',
    ecuador:
      'https://docs.google.com/presentation/d/1XFdzNQZTsz41HGmiJTJNS8PEA58v81-7wXfYM_NK7fw/embed?start=false&loop=false&delayms=60000',
    fiji:
      'https://docs.google.com/presentation/d/1vQdt7-GLFcPTXbqVgVgfeXxuLBlWC_UEnPl4QI7YO3o/embed?start=false&loop=false&delayms=60000',
    guinea:
      'https://docs.google.com/presentation/d/18LTsX2J_TcTBka71sqAeRrbpz3lcbt9_mG5_gJlbDL0/embed?start=false&loop=false&delayms=60000',
    kiribati:
      'https://docs.google.com/presentation/d/1OQzBX7ENOBIqyN4IVlIjkHSIi0rK8HiemQDEQd7EoAw/embed?start=false&loop=false&delayms=60000',
    mauritius:
      'https://docs.google.com/presentation/d/1NwF1K6msCOw5wPTQrG1bT5mj1FedHqBb12jp5tMU2bs/embed?start=false&loop=false&delayms=60000',
    'papua-new-guinea':
      'https://docs.google.com/presentation/d/1138KIzATxSJkHyKvwQeOE7sbjh9D3dHLJfinZGSJNKY/embed?start=false&loop=false&delayms=60000',
    peru:
      'https://docs.google.com/presentation/d/1xQoSaUZO2srqkxZsg8JV4JKe1XkbU4XrqNf4rp0p3oo/embed?start=false&loop=false&delayms=60000',
    'solomon-islands':
      'https://docs.google.com/presentation/d/16nQMFNjiwF-jWeYlha3puHsFiM0LqyNIk0-1MR7CTEI/embed?start=false&loop=false&delayms=60000',
    'south-africa':
      'https://docs.google.com/presentation/d/1n1fH0GNj49R67enGOe8GC8A67Wl1V5HUbAHc1-yIYlI/embed?start=false&loop=false&delayms=60000',
    togo:
      'https://docs.google.com/presentation/d/1dF983L-shNn4282HlNEqcZepvPwC3kM8wGV8SVsi_y0/embed?start=false&loop=false&delayms=60000',
    'trinidad-and-tobago':
      'https://docs.google.com/presentation/d/1xPJ9XL_P4jzXOg34x_ZCJ-UDZ_L2Db-bZq0ZoSS7m1U/embed?start=false&loop=false&delayms=60000',
    tuvalu:
      'https://docs.google.com/presentation/d/1TGcC6Iiz_MF3e2DZ7hG-p1NN5-WhigNpemrLCX0y3_Y/embed?start=false&loop=false&delayms=60000',
    vanuatu:
      'https://docs.google.com/presentation/d/19u-r0Jl0EFQzJ5LWuYkvAsOeuSuUNassaQA01Pi_39U/embed?start=false&loop=false&delayms=60000',
    jamaica:
      'https://docs.google.com/presentation/d/1gLAenFZYoBnW5lh7gRJOcTcKY1EDyXJLFIVH-gKp5kE/embed?start=false&loop=false&delayms=60000',
  },
}

const View = () => {
  const router = useRouter()
  const country = router.query.slug?.replace('plastic-strategy-', '')
  const slideURL = slides[router.locale].hasOwnProperty(country)
    ? slides[router.locale][country]
    : slides.en[country]

  const match = slideURL?.match(/\/d\/(.+?)\//)

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
        <a
          href={`https://docs.google.com/presentation/d/${match?.[1]}/export/pptx`}
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
