import React, { useEffect } from 'react'
import KnowledgeLib from '../../../modules/knowledge-lib/view'
import { UIStore } from '../../../store'
import api from '../../../utils/api'
import { loadCatalog } from '../../../translations/utils'
import Head from 'next/head'

function KnowledgeLibrary({ isAuthenticated }) {
  const { landing } = UIStore.useState((s) => ({
    landing: s.landing,
  }))

  const fetchMapData = () => {
    api.get(`/landing?entityGroup=topic`).then((resp) => {
      UIStore.update((e) => {
        e.landing = resp.data
      })
    })
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(landing).length === 0) {
      fetchMapData()
    }
  }, [])

  return (
    <>
      <Head>
        <title>Knowledge Library | UNEP GPML Digital Platform</title>
      </Head>
      <KnowledgeLib isAuthenticated={isAuthenticated} />
    </>
  )
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

export default React.memo(KnowledgeLibrary)
