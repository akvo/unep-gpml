import React, { useEffect } from 'react'
import KnowledgeLib from '../../../modules/knowledge-lib/view'
import { UIStore } from '../../../store'
import api from '../../../utils/api'

function KnowledgeLibrary({ isAuthenticated }) {
  const { landing } = UIStore.useState((s) => ({
    landing: s.landing,
  }))

  const fetchMapData = () => {
    api
      .get(`https://digital.gpmarinelitter.org/api/landing?entityGroup=topic`)
      .then((resp) => {
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

  return <KnowledgeLib isAuthenticated={isAuthenticated} />
}

export default React.memo(KnowledgeLibrary)
