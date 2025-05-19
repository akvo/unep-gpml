import React from 'react'
import CountryLib from '../../modules/country-dashboard/view'
import Head from 'next/head'
import { loadCatalog } from '../../translations/utils'

function CountryView({ isAuthenticated }) {
  return (
    <>
      <Head>
        <style>{`
          body {
              @media (max-width: 768px) {
              overflow-x: hidden;
            }
          }
        `}</style>
        <title>Country Dashboard | UNEP GPML Digital Platform</title>
      </Head>
      <CountryLib isAuthenticated={isAuthenticated} />
    </>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default React.memo(CountryView)
