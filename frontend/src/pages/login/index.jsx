import React from 'react'
import LoginView from '../../modules/login/login-view'
import { loadCatalog } from '../../translations/utils'

function Login({}) {
  return <LoginView />
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Login
