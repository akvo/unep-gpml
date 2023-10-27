import React from 'react'
import AboutUsPage from '../../modules/about/about-us'
import { loadCatalog } from '../../translations/utils'

function AboutUs() {
  return <AboutUsPage />
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default AboutUs
