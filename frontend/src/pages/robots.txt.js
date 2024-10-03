export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/plain')
  const robotsTxt = `
    User-agent: *
    Disallow: /stakeholder/
    Disallow: /organisation/
    Disallow: /workspace/
    
    Allow: /data/maps
    Allow: /knowledge-hub
    Allow: /knowledge/learning-centre
    Allow: /post/
    Allow: /page/
    Allow: /partnership
    Allow: /cop
    Allow: /forum
    Allow: /technical-resource/
    Allow: /policy/
    Allow: /action-plan/
    Allow: /event/
    Allow: /financing-resource/
    Allow: /technology/

    Sitemap: https://digital.gpmarinelitter.org/sitemap.xml
    `

  res.write(robotsTxt)
  res.end()

  return { props: {} }
}

export default function Robots() {
  return null
}
