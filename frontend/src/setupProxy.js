const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/api", "/image", "/env.js", "/cv"],
    createProxyMiddleware({
      target: "http://backend:3000",
      changeOrigin: true,
    })
  );
};
