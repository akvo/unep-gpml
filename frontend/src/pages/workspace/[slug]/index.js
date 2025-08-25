import NestedLayout from './layout'
import NewLayout from '../../../layouts/new-layout'
import style from './index.module.scss'
import { Trans } from '@lingui/macro'
import Button from '../../../components/button'
import { loadCatalog } from '../../../translations/utils'
import { useRouter } from 'next/router'
import { PREFIX_SLUG, isoA2 } from '../../../modules/workspace/ps/config'
import { useStepInstructions } from '../../../hooks/useStepInstructions'
import { MarkdownRenderer } from '../../../components/markdown-renderer/MarkdownRenderer'

const links = {
  PG:
    'https://docs.google.com/document/d/1MTWraV20XYzwXDxkFTdRcbkMz-GO-xgE/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  ZA:
    'https://docs.google.com/document/d/129KI2ideXphYCfMubD8KSXp0SHlDx3v9/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  TG:
    'https://docs.google.com/document/d/1wjyDbvgqhyNLBHecgEoYJmzrpQ2IqFzUi0TJTav_lw8/edit?usp=sharing',
  SN:
    'https://docs.google.com/document/d/1BhaiuBY5gpnvtsl2CWY2RdMLpBEeT3Af/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  KI:
    'https://docs.google.com/document/d/1Mg7723ABDnF8gEecDjw035N1xgaAQSI4/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  VU:
    'https://docs.google.com/document/d/1-CyDFV-ZqPG_c0Um8vk743CBphuB9OWq/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  SB:
    'https://docs.google.com/document/d/12sa2TIOa5wKENeefOEIbvAknYXaD1HHu/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  TO:
    'https://docs.google.com/document/d/1cIgDRB-5HS5O_1R-WteDeLJj58bbgWkP/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  EC:
    'https://docs.google.com/document/d/11Wo7ebDmcJ6bgpCnD16Bw-2suMZSm8i9/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  TT:
    'https://docs.google.com/document/d/1nwNthT0sUM5A11T7VxEtjvT-ElfWmdWw/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  KH:
    'https://docs.google.com/document/d/1tkRQTf8i5PUvlqHbHM-MpjWLP4zKG8u9/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  TV:
    'https://docs.google.com/document/d/1nif7gPJfq71bRbYCbQYs9MkNQoMXcaYH/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  MU:
    'https://docs.google.com/document/d/10HqdlypQtYOmT53Uwc4JWbi4MZb5rQ3Z/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  PE:
    'https://docs.google.com/document/d/1Hgr9I0DXc5jjxuIwv76M73IyRl7LzEIg/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  FJ:
    'https://docs.google.com/document/d/1DX6ZQSYe1k6kTlJ7py7v63_8LSVXcqh4/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  GN:
    'https://docs.google.com/document/d/1LRTO9IPY9xaZZ_RiNBRjJbYQ4_1CPISp/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  CI:
    'https://docs.google.com/document/d/1xdgmeCv6MKdpdI2Zy5FM5ytwrNZYDt7m/edit?usp=sharing&ouid=116096234198181148284&rtpof=true&sd=true',
  WS:
    'https://docs.google.com/document/d/1nMYX7rTRwhrffTCXMvaGIFPxFSTUy33Wl7qQKtJwSUI/edit?usp=sharing',
}

const Page = () => {
  const router = useRouter()
  const { slug } = router.query
  const strapiSlug = 'instructions'
  const { data } = useStepInstructions(strapiSlug)

  const [_, countrySlug] = slug?.split(`${PREFIX_SLUG}-`)
  const countryISOA2 =
    isoA2?.[countrySlug === 'cote-d-ivoire' ? 'ivory-coast' : countrySlug]

  return (
    <div className={style.view}>
      <h2 className="w-bold">{data?.title}</h2>
      <MarkdownRenderer content={data?.content} />
    </div>
  )
}

export function PageLayout(page) {
  const {
    isAuthenticated,
    loginVisible,
    setLoginVisible,
    profile,
    auth0Client,
  } = page.props
  return (
    <NewLayout
      {...{
        isAuthenticated,
        loginVisible,
        setLoginVisible,
        profile,
        auth0Client,
      }}
    >
      <NestedLayout>{page}</NestedLayout>
    </NewLayout>
  )
}

export default Page

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

Page.getLayout = PageLayout
