import React from 'react'
import StakeholderDetailPage from '../../modules/stakeholder-detail/view'
import { loadCatalog } from '../../translations/utils'

function StakeholderDetail({
  setLoginVisible,
  isAuthenticated,
  loadingProfile,
}) {
  return (
    <StakeholderDetailPage
      {...{ loadingProfile, setLoginVisible, isAuthenticated }}
    />
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

export default StakeholderDetail
