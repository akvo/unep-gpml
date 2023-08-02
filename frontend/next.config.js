module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://digital.gpmarinelitter.org/api/:path*",
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
      use: ["@svgr/webpack"],
    });
    return config;
  },
};
