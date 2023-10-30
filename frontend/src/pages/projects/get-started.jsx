import React from 'react'
import GetStartedPage from '../../modules/projects/get-started'
import { loadCatalog } from '../../translations/utils'

function GetStarted() {
  return <GetStartedPage />
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default GetStarted
