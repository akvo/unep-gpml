import React from 'react'
import CaseStudiesPage from '../../../modules/case-studies/view'
import { loadCatalog } from '../../../translations/utils'

function CaseStudies() {
  return <CaseStudiesPage />
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default CaseStudies
