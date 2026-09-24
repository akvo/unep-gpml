import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { Trans } from '@lingui/macro'
import api from '../../utils/api'
import { getStrapiUrl, transformStrapiResponse } from '../../utils/misc'
import { loadCatalog } from '../../translations/utils'
import styles from './topic.module.scss'

function TopicPage() {
  const router = useRouter()
  const { slug } = router.query
  const [topic, setTopic] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    const fetchTopic = async () => {
      try {
        const res = await api.get(
          `/topics?filters[topicId][$eq]=${slug}&populate=*`
        )
        const data = transformStrapiResponse(res.data)
        setTopic(data?.[0] || null)
      } catch (err) {
        console.error('Failed to load topic', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTopic()
  }, [slug])

  if (loading) {
    return null
  }

  if (!topic) {
    return (
      <div className={styles.topicPage}>
        <p>
          <Trans>Topic not found.</Trans>
        </p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{topic.name} | UNEP GPML Digital Platform</title>
      </Head>
      <div className={styles.topicPage}>
        <div className={styles.topicHeader}>
          {topic.icon?.url && (
            <Image
              src={getStrapiUrl(topic.icon.url)}
              width={64}
              height={64}
              alt={`${topic.name} icon`}
            />
          )}
          <h1>{topic.name}</h1>
        </div>

        <p className={styles.topicIntro}>{topic.pageIntro}</p>

        {Array.isArray(topic.charts) && topic.charts.length > 0 && (
          <div className={styles.chartGrid}>
            {topic.charts.map((chart, i) => (
              <div className={styles.chartPreview} key={i}>
                <span className={styles.chartLabel}>{chart.chartLabel}</span>
                <span className={styles.chartStatus}>
                  {chart.sourceLabel || 'preview — live chart pending'}
                </span>
              </div>
            ))}
          </div>
        )}

        {Array.isArray(topic.resources) && topic.resources.length > 0 && (
          <div className={styles.resourceList}>
            <h2>
              <Trans>Resources</Trans>
            </h2>
            <ul>
              {topic.resources.map((resource, i) => (
                                <li key={i}><a
                  
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resource.title}
                  </a>
                  {resource.description && <p>{resource.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
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

export default TopicPage