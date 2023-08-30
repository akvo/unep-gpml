module.exports = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.REACT_APP_FEENV
          ? "https://digital.gpmarinelitter.org/api/:path*"
          : "https://unep-gpml.akvotest.org/api/:path*",
      },
      {
        source: "/image/:path*",
        destination: process.env.REACT_APP_FEENV
          ? "https://digital.gpmarinelitter.org/image/:path*"
          : "http://backend:3000/image/:path*",
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: false,
            clean: false,
          },
        },
      ],
    });
    return config;
  },
};
