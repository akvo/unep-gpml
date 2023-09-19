module.exports = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.REACT_APP_FEENV
          ? 'https://unep-gpml.akvotest.org/api/:path*'
          : 'http://backend:3000/api/:path*',
      },
      {
        source: '/image/:path*',
        destination: process.env.REACT_APP_FEENV
          ? 'https://unep-gpml.akvotest.org/image/:path*'
          : 'http://backend:3000/image/:path*',
      },
      {
        source: '/env.js',
        destination: process.env.REACT_APP_FEENV
          ? 'https://unep-gpml.akvotest.org/env.js'
          : 'http://backend:3000/env.js',
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
