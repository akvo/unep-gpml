import React from 'react'
import EventPage from '../../modules/event-page/view'
import { loadCatalog } from '../../translations/utils'
import Head from 'next/head'

function Events({ setLoginVisible, isAuthenticated }) {
  return (
    <>
      <Head>
        <title>Events | UNEP GPML Digital Platform</title>
      </Head>
      <EventPage
        setLoginVisible={setLoginVisible}
        isAuthenticated={isAuthenticated}
      />
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

export default Events
