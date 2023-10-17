import React from 'react'
import Landing from '../modules/landing/landing'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { loadCatalog } from '../translations/utils'

function HomePage({ isAuthenticated, setLoginVisible }) {
  return (
    <Landing
      isAuthenticated={isAuthenticated}
      setLoginVisible={setLoginVisible}
    />
  )
}

export async function getServerSideProps(ctx) {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default HomePage
