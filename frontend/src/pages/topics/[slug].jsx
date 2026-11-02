import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { Trans } from '@lingui/macro'
import DOMPurify from 'isomorphic-dompurify'
import { getStrapiUrl, transformStrapiResponse } from '../../utils/misc'
import { loadCatalog } from '../../translations/utils'
import api from '../../utils/api'
import ResourceCard from '../../components/resource-card/resource-card'
import styles from './topic.module.scss'

const getIconUrl = (icon) => {
  const url = icon?.data?.attributes?.url
  if (!url) return null
  return url.startsWith('http') ? url : `${getStrapiUrl()}${url}`
}

// Knowledge Hub links like https://globalplasticshub.org/technical-resource/123
const parseHubLink = (link) => {
  const match = String(link || '').match(/\/([a-z_-]+)\/(\d+)\/?(?:[?#].*)?$/i)
  if (!match) return null
  return { type: match[1].toLowerCase().replace(/-/g, '_'), id: match[2] }
}

function TopicPage() {
  const router = useRouter()
  const { slug } = router.query
  const [topic, setTopic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hubItems, setHubItems] = useState([])

  useEffect(() => {
    if (!slug) return

    const fetchTopic = async () => {
      try {
        const res = await fetch(
          `${getStrapiUrl()}/api/topics?locale=${router.locale}&filters[topicId][$eq]=${slug}&populate=*`
        )
        const json = await res.json()
        const data = transformStrapiResponse(json?.data || [])
        setTopic(data?.[0] || null)
      } catch (err) {
        console.error('Failed to load topic', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTopic()
  }, [slug, router.locale])

  useEffect(() => {
    const links = Array.isArray(topic?.hubResources) ? topic.hubResources : []
    const refs = links.map(parseHubLink).filter(Boolean)
    if (!refs.length) {
      setHubItems([])
      return
    }
    Promise.all(
      refs.map(({ type, id }) =>
        api
          .get(`/detail/${type}/${id}`)
          .then(({ data }) => {
            const picture = data?.thumbnail || data?.image
            return {
              id: data?.id ?? Number(id),
              type,
              title: data?.title || data?.name,
              likes: data?.likes,
              ...(picture && { images: { thumbnail: { url: picture } } }),
            }
          })
          .catch(() => null)
      )
    ).then((items) => setHubItems(items.filter(Boolean)))
  }, [topic])

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
      <div
        className={styles.topicPage}
        style={{ '--accent': topic.accentColor || '#7468ff' }}
      >
        <div className={styles.topicHeader}>
          <div className={styles.topicTitle}>
            {getIconUrl(topic.icon) && (
              <Image
                src={getIconUrl(topic.icon)}
                width={125}
                height={64}
                alt={`${topic.name} icon`}
              />
            )}
            <h1>{topic.name}</h1>
          </div>
        </div>

        {topic.narrative ? (
          <div
            className={styles.narrative}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(topic.narrative),
            }}
          />
        ) : (
          <div className={styles.topicTop}>
            <p className={styles.topicIntro}>{topic.pageIntro}</p>

            {Array.isArray(topic.charts) && topic.charts.length > 0 && (
              <div className={styles.chartGrid}>
                {topic.charts.map((chart, i) => (
                  <div className={styles.chartPreview} key={i}>
                    <span className={styles.chartEyebrow}>
                      <Trans>Chart preview</Trans>
                    </span>
                    <span className={styles.chartLabel}>
                      {chart.chartLabel}
                    </span>
                    <span className={styles.chartStatus}>
                      {chart.sourceLabel || (
                        <Trans>preview, live chart pending</Trans>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <hr className={styles.divider} />

        {hubItems.length > 0 && (
          <div className={styles.cardRow}>
            {hubItems.map((item) => (
              <ResourceCard
                key={`${item.type}-${item.id}`}
                item={item}
                onClick={() =>
                  router.push(`/${item.type.replace(/_/g, '-')}/${item.id}`)
                }
              />
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
                <li key={i}>
                  {resource.url ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {resource.title}
                    </a>
                  ) : (
                    <strong>{resource.title}</strong>
                  )}
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
