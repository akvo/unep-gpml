import React from 'react'
import SignupView from '../../modules/signup/view'
import { loadCatalog } from '../../translations/utils'

function EntitySignUp() {
  return <SignupView formType="entity" match={{ params: {} }} />
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default EntitySignUp
