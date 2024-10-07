const linguiConfig = require('./lingui.config')

const nextConfig = {
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
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/unep-gpml-public-production/**',
      },
      {
        protocol: 'https',
        hostname: 'unep-gpml.akvotest.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'digital.gpmarinelitter.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    let domain = 'http://backend:3000'
    if (process.env.REACT_APP_FEENV_LOCAL_DEV_NO_DOCKER) {
      // For local development without Docker
      domain = 'http://localhost:3000'
    }
    if (process.env.REACT_APP_FEENV) {
      domain = 'https://unep-gpml.akvotest.org'
    }
    if (process.env.REACT_APP_FEENV_STAGING) {
      domain = 'https://unep-gpml-staging.akvotest.org'
    }
    if (process.env.REACT_APP_FEENV_PROD) {
      domain = 'https://digital.gpmarinelitter.org'
    }
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
  async redirects() {
    return [
      {
        source: '/about-us',
        destination: '/page/who-we-are',
        permanent: true,
      },
      {
        source: '/knowledge/capacity-development',
        destination: '/knowledge/learning-centre',
        permanent: true,
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

// Conditionally apply Sentry configuration
if (process.env.NODE_ENV !== 'development') {
  const { withSentryConfig } = require('@sentry/nextjs')

  module.exports = withSentryConfig(
    nextConfig,
    {
      silent: true,
      org: 'akvo-foundation',
      project: 'unep-gpml-frontend',
    },
    {
      widenClientFileUpload: true,
      transpileClientSDK: true,
      tunnelRoute: '/monitoring',
      hideSourceMaps: true,
      disableLogger: true,
    }
  )
} else {
  module.exports = nextConfig
}