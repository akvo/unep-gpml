import React from 'react'
import FlexibleFormsPage from '../../modules/flexible-forms/view'
import { loadCatalog } from '../../translations/utils'

function FlexibleForms({ isAuthenticated, setLoginVisible }) {
  return (
    <FlexibleFormsPage
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

export default FlexibleForms
