import React from 'react'
import EntityDetail from '../../modules/entity-detail/view'
import { loadCatalog } from '../../translations/utils'

function Organisation({ isAuthenticated }) {
  return <EntityDetail isAuthenticated={isAuthenticated} />
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Organisation
