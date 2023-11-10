import React from 'react'
import WorkspacePage from '../../modules/workspace/view'
import { loadCatalog } from '../../translations/utils'

function Workspace({ profile }) {
  return <WorkspacePage profile={profile} />
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Workspace
