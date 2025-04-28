export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/xml')

  const dynamicRoutes = []

  const EXTERNAL_DATA_URL = 'https://globalplasticshub.org'

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${EXTERNAL_DATA_URL}/</loc>
        </url>
        <url>
          <loc>${EXTERNAL_DATA_URL}/data/maps</loc>
        </url>
        <url>
          <loc>${EXTERNAL_DATA_URL}/knowledge/hub</loc>
        </url>
        ${dynamicRoutes
          .map(
            (route) => `
            <url>
              <loc>${EXTERNAL_DATA_URL}/${route.type}/${route.id}</loc>
            </url>
          `
          )
          .join('')}
      </urlset>`

  res.write(sitemap)
  res.end()

  return { props: {} }
}

export default function Sitemap() {
  return null
}
