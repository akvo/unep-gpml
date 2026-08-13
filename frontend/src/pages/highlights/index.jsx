import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Trans } from '../../translations/utils'
import { getStrapiUrl } from '../../utils/misc'

const stripHtml = (html) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

const transformStrapiResponse = (data) => {
  if (!data) return []
  return data.map((item) => ({
    id: item.id,
    ...item.attributes,
  }))
}

export default function HighlightsPage({ i18n }) {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const strapiUrl = getStrapiUrl()

  useEffect(() => {
    fetch(
      `${strapiUrl}/api/posts?locale=${router.locale}&populate=cover&sort=id:desc&pagination[pageSize]=100`
    )
      .then((d) => d.json())
      .then((d) => {
        setItems(transformStrapiResponse(d.data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>

        <div style={{ marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
          <Link href="/" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>
            ← <Trans>Back to Home</Trans>
          </Link>
          <h1 style={{ marginTop: '16px', fontSize: '32px', fontWeight: 'bold', color: '#020A5C' }}>
            <Trans>Highlights</Trans>
          </h1>
          <p style={{ color: '#666', marginTop: '8px' }}>
            <Trans>Latest news and updates from the Global Plastics Hub</Trans>
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            <Trans>Loading...</Trans>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            <Trans>No highlights available at this time.</Trans>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/post/${item.id}-${item.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {item.cover?.data?.attributes?.formats?.medium?.url && (
                    <div style={{ position: 'relative', height: '180px', flexShrink: 0 }}>
                      <Image
                        src={item.cover.data.attributes.formats.medium.url}
                        alt={item.title || ''}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#020A5C',
                        marginBottom: '10px',
                        lineHeight: '1.4',
                      }}
                    >
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', flex: 1 }}>
                      {stripHtml(item.content)?.substring(0, 150)}...
                    </p>
                    <div style={{ marginTop: '16px', fontSize: '14px', color: '#020A5C', fontWeight: '500' }}>
                      <Trans>Read More</Trans> →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export async function getServerSideProps(ctx) {
const { default: loadCatalog } = await import('../../translations/utils')
  const i18n = await loadCatalog(ctx.locale)
  return { props: { i18n } }
}