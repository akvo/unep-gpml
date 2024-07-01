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
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/unep-gpml-public-production/**',
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

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: 'akvo-foundation',
    project: 'unep-gpml-frontend',
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: '/monitoring',

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
)
