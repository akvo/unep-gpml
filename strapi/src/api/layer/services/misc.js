function getStrapiUrl() {
  let $env = process.env.NEXT_PUBLIC_ENV || 'test'
  const domains = {
      test: 'unep-gpml.akvotest.org',
      staging: 'unep-gpml.akvotest.org',
      prod: 'digital.gpmarinelitter.org',
  }
  return `https://${domains[$env]}/strapi`
}

module.exports = getStrapiUrl
