import React from 'react'
import CountryLib from '../../modules/country-dashboard/view'

import Head from 'next/head'
function CountryView({ isAuthenticated }) {
  return (
    <>
      <Head>
        <title>Knowledge Library | UNEP GPML Digital Platform</title>
      </Head>
      <CountryLib isAuthenticated={isAuthenticated} />
    </>
  )
}

export default React.memo(CountryView)
