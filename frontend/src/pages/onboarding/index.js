import React from 'react'
import OnboardingView from '../../modules/onboarding/view'
import { loadCatalog } from '../../translations/utils'

function Onboarding() {
  return <OnboardingView />
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default Onboarding
