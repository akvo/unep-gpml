import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'
import { Trans } from '@lingui/macro'
import Link from 'next/link'
import { useRouter } from 'next/router'
import api from '../../utils/api'

function UnsubscribeChat() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      setLoading(true)
      api
        .post(`/stakeholder/${id}/chat-unsubcribe`)
        .then((response) => {})
        .catch((error) => {
          setError(error.response.data.message)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      router.push({
        pathname: '/',
      })
    }
  }, [id])

  return (
    <div className={styles.unsubscribeChat}>
      <h6 className="semibold">
        {loading && <Trans>Unsubscribing...</Trans>}
        {!loading && error && <p>Error: {error}</p>}
        {!loading && !error && (
          <Trans>
            You will no longer receive email notifications for forum activity.
            You can turn this back on from your{' '}
            <Link href={`/stakeholder/${id}`}>profile</Link>.
          </Trans>
        )}
      </h6>
    </div>
  )
}

export default UnsubscribeChat
