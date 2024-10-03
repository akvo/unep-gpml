const EXTERNAL_DATA_URL = 'https://digital.gpmarinelitter.org/'

const dynamicRoutes = []

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Static URLs -->
      <url>
        <loc>${EXTERNAL_DATA_URL}/</loc>
      </url>
      <url>
        <loc>${EXTERNAL_DATA_URL}/data/maps</loc>
      </url>
      <url>
        <loc>${EXTERNAL_DATA_URL}/knowledge-hub</loc>
      </url>
      <url>
        <loc>${EXTERNAL_DATA_URL}/knowledge/learning-centre</loc>
      </url>

      <!-- Dynamic URLs -->
      ${dynamicRoutes
        .map((route) => {
          return `
            <url>
              <loc>${EXTERNAL_DATA_URL}/${route.type}/${route.id}</loc>
            </url>
          `
        })
        .join('')}
    </urlset>
  `

  res.status(200).end(sitemap)
}
