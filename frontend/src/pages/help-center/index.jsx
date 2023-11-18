import React from 'react'
import HelpCenterPage from '../../modules/help-center/view'
import { loadCatalog } from '../../translations/utils'
import Head from 'next/head'

function HelpCenter() {
  return (
    <>
      <Head>
        <title>Help Centre | UNEP GPML Digital Platform</title>
      </Head>
      <HelpCenterPage />
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

export default HelpCenter
