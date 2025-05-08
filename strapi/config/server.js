module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'http://localhost/strapi',
  proxy: true,
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  requestTimeout: 120000,
});

// module.exports = ({ env }) => ({
//   host: env('HOST', '0.0.0.0'),
//   port: env.int('PORT', 1337),
//   url: 'http://localhost:1337',
//   proxy: true,
//   app: {
//     keys: ['2xSiIvRfu0uUTVa7dNpuDQ==,s8VN7AgSASrqzm3m9JN8Gw==,D6uWOnWhY4uKhPnFLq9Flw==,uJ7ExrUyqturazGynkwqbQ=='],
//   },
//   apiToken: {
//     salt: env('sL43vMCXXc65JfxhYdpGhQ=='),
//   },
//   webhooks: {
//     populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
//   },
 
// });