import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'
import { Trans } from '@lingui/macro'
import Link from 'next/link'
import { useRouter } from 'next/router'
import api from '../../utils/api'
import { UIStore } from '../../store'
import { loadCatalog } from '../../translations/utils'

function UnsubscribeChat({
  isAuthenticated,
  setLoginVisible,
  loadingProfile,
  setShouldLoginClose,
}) {
  const { profile } = UIStore.currentState
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated && profile && Object.keys(profile).length > 0) {
      setLoading(true)
      api
        .post(`/stakeholder/${profile.id}/chat-unsubcribe`)
        .then((response) => {})
        .catch((error) => {
          setError(error.response.data.message)
        })
        .finally(() => {
          setLoading(false)
        })
    }
    if (!isAuthenticated && !loadingProfile) {
      setLoading(false)
      setShouldLoginClose(true)
      setLoginVisible(true)
    }
  }, [profile, loadingProfile, isAuthenticated])

  return (
    <div className={styles.unsubscribeChat}>
      <h6 className="semibold">
        {!isAuthenticated && !loadingProfile && (
          <Trans>Login to proceed...</Trans>
        )}
        {loading && <Trans>Unsubscribing...</Trans>}
        {!loading && error && <p>Error: {error}</p>}
        {!loading && !error && isAuthenticated && !loadingProfile && (
          <Trans>
            You will no longer receive email notifications for forum activity.
            You can turn this back on from your{' '}
            <Link href={`/stakeholder/${profile.id}`}>profile</Link>.
          </Trans>
        )}
      </h6>
    </div>
  )
}

export const getStaticProps = async (ctx) => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale),
    },
  }
}

export default UnsubscribeChat
