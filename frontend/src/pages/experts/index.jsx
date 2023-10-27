import React from 'react'
import ExpertsPage from '../../modules/experts/view'
import { loadCatalog } from '../../translations/utils'

function Experts({ setLoginVisible, isAuthenticated }) {
  return (
    <ExpertsPage
      setLoginVisible={setLoginVisible}
      isAuthenticated={isAuthenticated}
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

export default Experts
