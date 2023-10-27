import React from 'react'
import HelpCenterPage from '../../modules/help-center/view'
import { loadCatalog } from '../../translations/utils'

function HelpCenter() {
  return <HelpCenterPage />
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default HelpCenter
