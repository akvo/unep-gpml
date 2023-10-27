import React from 'react'
import Landing from '../modules/landing/landing'
import { loadCatalog } from '../translations/utils'
import Landing from '../pages/landing'

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
