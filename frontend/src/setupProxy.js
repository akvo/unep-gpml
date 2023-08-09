const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/api", "/image", "/env.js", "/cv"],
    createProxyMiddleware({
      target: process.env.REACT_APP_FEENV
        ? "https://digital.gpmarinelitter.org/"
        : "http://backend:3000",
      changeOrigin: true,
    })
  );
};
