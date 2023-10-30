const linguiConfig = require('./lingui.config')

module.exports = {
  reactStrictMode: false,
  i18n: {
    locales: linguiConfig.locales,
    defaultLocale: linguiConfig.sourceLocale,
  },
  experimental: {
    swcPlugins: [['@lingui/swc-plugin', {}]],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/unep-gpml-public-test/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/unep-gpml-public-staging/**',
      },
    ],
  },
  async rewrites() {
    let domain = 'http://backend:3000'
    if (process.env.REACT_APP_FEENV) {
      domain = 'https://unep-gpml.akvotest.org'
    }
    if (process.env.REACT_APP_FEENV_STAGING) {
      domain = 'https://unep-gpml-staging.akvotest.org'
    }
    console.log(domain)
    return [
      {
        source: '/api/:path*',
        destination: `${domain}/api/:path*`,
      },
      {
        source: '/image/:path*',
        destination: `${domain}/image/:path*`,
      },
      {
        source: '/env.js',
        destination: `${domain}/env.js`,
      },
    ]
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: false,
            clean: false,
          },
        },
      ],
    })
    return config
  },
}
