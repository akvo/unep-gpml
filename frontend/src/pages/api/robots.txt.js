export default function handler(req, res) {
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

  // Send robots.txt content as response
  res.status(200).send(robotsTxt)
}
