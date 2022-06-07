const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/api", "/image", "/env.js", "/cv"],
    createProxyMiddleware({
      target: process.env.REACT_APP_FEENV
        ? "https://unep-gpml.akvotest.org/"
        : "http://backend:3000",
      changeOrigin: true,
    })
  );
};
