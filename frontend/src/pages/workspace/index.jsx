import React, { useCallback, useEffect } from 'react'
import WorkspacePage from '../../modules/workspace/view'
import { loadCatalog } from '../../translations/utils'
import Head from 'next/head'
import { ChatStore } from '../../store'
import { mockCallSSO } from '../forum-dsc'

function Workspace({ profile, isAuthenticated, setLoginVisible }) {
  const accessToken = ChatStore.useState((s) => s.accessToken)

  const handleOnSSO = useCallback(async () => {
    if (!accessToken && profile?.email) {
      const { accessToken: _accessToken } = await mockCallSSO()
      ChatStore.update((s) => {
        s.accessToken = _accessToken
      })
    }
  }, [accessToken, profile])

  useEffect(() => {
    handleOnSSO()
  }, [handleOnSSO])

  return (
    <>
      <Head>
        <title>Workspace | UNEP GPML Digital Platform</title>
      </Head>
      <WorkspacePage {...{ profile, isAuthenticated, setLoginVisible }} />
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

export default Workspace
