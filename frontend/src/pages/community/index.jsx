import React from 'react'
import StakeholderOverview from '../../modules/stakeholder-overview/view'
import { loadCatalog } from '../../translations/utils'

function Community({ setLoginVisible, isAuthenticated, loadingProfile }) {
  return (
    <StakeholderOverview
      setLoginVisible={setLoginVisible}
      isAuthenticated={isAuthenticated}
      loadingProfile={loadingProfile}
    />
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Community
