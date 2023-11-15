import React from 'react'
import WorkspacePage from '../../modules/workspace/view'
import { loadCatalog } from '../../translations/utils'
import Head from 'next/head'

function Workspace({ profile, isAuthenticated, setLoginVisible }) {
  return (
    <>
      <Head>
        <title>Workspace | UNEP GPML Digital Platform</title>
      </Head>
      <WorkspacePage {...{ profile, isAuthenticated, setLoginVisible }} />
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

export default Workspace
