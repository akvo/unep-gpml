import React from 'react'
import ExpertsPage from '../../modules/experts/view'
import { loadCatalog } from '../../translations/utils'
import Head from 'next/head'

function Experts({ setLoginVisible, isAuthenticated }) {
  return (
    <>
      <Head>
        <title>Experts | UNEP GPML Digital Platform</title>
      </Head>
      <ExpertsPage
        setLoginVisible={setLoginVisible}
        isAuthenticated={isAuthenticated}
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

export default Experts
