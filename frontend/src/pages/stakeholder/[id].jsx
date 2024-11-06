import React from 'react'
import StakeholderDetailPage from '../../modules/stakeholder-detail/view'
import { loadCatalog } from '../../translations/utils'
import withAuth from '../../components/withAuth'
import DetailView from '../../modules/community-hub/detail-view'
import { useRouter } from 'next/router'

function StakeholderDetail({
  setLoginVisible,
  isAuthenticated,
  loadingProfile,
  profile,
}) {
  const router = useRouter()
  return (
    <div className="container" style={{ padding: '30px 0' }}>
      <DetailView
        item={{ id: router.query.id, type: 'stakeholder' }}
        {...{ profile }}
      />
    </div>
  )
}

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

export default withAuth(StakeholderDetail)
