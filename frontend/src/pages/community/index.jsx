import React from 'react'
import StakeholderOverview from '../../modules/stakeholder-overview/view'
import { loadCatalog } from '../../translations/utils'
import Head from 'next/head'

function Community({ setLoginVisible, isAuthenticated, loadingProfile }) {
  return (
    <>
      <Head>
        <title>Members | UNEP GPML Digital Platform</title>
      </Head>
      <StakeholderOverview
        {...{ loadingProfile, setLoginVisible, isAuthenticated }}
      />
    </>
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
