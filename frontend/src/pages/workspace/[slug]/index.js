import NestedLayout from './layout'
import NewLayout from '../../../layouts/new-layout'
import style from './index.module.scss'
import { Trans } from '@lingui/macro'
import Button from '../../../components/button'
import { loadCatalog } from '../../../translations/utils'
import { useRouter } from 'next/router'
import { PREFIX_SLUG, isoA2 } from '../../../modules/workspace/ps/config'
import { useStepInstructions } from '../../../hooks/useStepInstructions'

const Page = () => {
  const router = useRouter()
  const { slug } = router.query
  const strapiSlug = 'instructions'
  const { data } = useStepInstructions(strapiSlug, router.locale)

  const [_, countrySlug] = slug?.split(`${PREFIX_SLUG}-`)
  const countryISOA2 =
    isoA2?.[countrySlug === 'cote-d-ivoire' ? 'ivory-coast' : countrySlug]

  return (
    <div className={style.view}>
      <h2 className="w-bold">{data?.title}</h2>
      <div
        className="strapi-workflow-page"
        dangerouslySetInnerHTML={{ __html: data?.content }}
      ></div>
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
